"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export interface SignaturePadHandle {
  /** Returns a PNG data URL of the current signature, or null if empty. */
  getDataUrl: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  height?: number;
  /** Fires whenever the signed/empty state changes — lets the parent track
   * this as real state instead of reading the ref during render (refs don't
   * trigger re-renders, so a parent relying on ref.current.isEmpty() in its
   * render body can show a stale disabled/enabled state). */
  onChange?: (isEmpty: boolean) => void;
}

// Lightweight inline canvas signature pad — no external dependency.
// Supports mouse and touch input. White-on-transparent strokes are drawn
// against a white canvas background so the exported PNG is legible
// regardless of where it's later displayed.
const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ height = 160, onChange }, ref) {
    const theme = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const [hasStroke, setHasStroke] = useState(false);

    // Keep the canvas's internal pixel buffer in sync with its displayed
    // size (accounting for devicePixelRatio) so strokes aren't blurry/offset.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(dpr, dpr);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, rect.width, rect.height);
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = "#111111";
        }
      };

      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, []);

    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const point = getPoint(e);
      if (!point) return;
      isDrawingRef.current = true;
      lastPointRef.current = point;
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const point = getPoint(e);
      if (!canvas || !ctx || !point || !lastPointRef.current) return;

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      lastPointRef.current = point;
      setHasStroke(true);
    };

    const handlePointerUp = () => {
      isDrawingRef.current = false;
      lastPointRef.current = null;
    };

    const clear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, rect.height);
      setHasStroke(false);
    };

    // Notify the parent whenever signed/empty state actually changes —
    // covers both drawing a stroke and clearing the pad.
    useEffect(() => {
      onChange?.(!hasStroke);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasStroke]);

    useImperativeHandle(ref, () => ({
      getDataUrl: () => {
        if (!hasStroke || !canvasRef.current) return null;
        return canvasRef.current.toDataURL("image/png");
      },
      clear,
      isEmpty: () => !hasStroke,
    }));

    return (
      <Box>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.75rem",
            fontWeight: 600,
            mb: 0.75,
          }}
        >
          Signature
        </Typography>
        <Box
          sx={{
            border: `1px solid ${
              hasStroke
                ? theme.palette.secondary.main
                : "rgba(255,255,255,0.15)"
            }`,
            borderRadius: 1.5,
            overflow: "hidden",
            transition: "border-color 0.2s",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height,
              display: "block",
              touchAction: "none", // prevents scroll/zoom while drawing on touch
              cursor: "crosshair",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </Box>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mt: 0.75 }}
        >
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.35)" }}
          >
            {hasStroke ? "Signed" : "Sign above to confirm"}
          </Typography>
          <Button
            size="small"
            onClick={clear}
            disabled={!hasStroke}
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.7rem",
              minWidth: "auto",
              p: 0,
              "&:hover": { background: "transparent", color: "#fff" },
            }}
          >
            Clear
          </Button>
        </Box>
      </Box>
    );
  },
);

export default SignaturePad;
