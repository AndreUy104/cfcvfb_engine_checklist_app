"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import { useTheme } from "@mui/material/styles";
import { PowerTool } from "@/utilities/types/equipment.types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PowerToolCheckModalProps {
  open: boolean;
  tool: PowerTool | null;
  onClose: () => void;
  onSubmit: (data: PowerToolCheckFormData) => void;
}

export interface PowerToolCheckFormData {
  toolId: string;
  running: boolean;
  fuel: string;
  remarks: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FUEL_LEVELS = ["Full", "3/4", "1/2", "1/4", "Empty"] as const;

const INITIAL_FORM: Omit<PowerToolCheckFormData, "toolId"> = {
  running: false,
  fuel: "",
  remarks: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PowerToolCheckModal({
  open,
  tool,
  onClose,
  onSubmit,
}: PowerToolCheckModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState(INITIAL_FORM);

  const handleClose = () => {
    setForm(INITIAL_FORM);
    onClose();
  };

  const handleSubmit = () => {
    if (!tool) return;
    onSubmit({ toolId: tool.id, ...form });
    handleClose();
  };

  const textFieldSx = {
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontWeight: 600 },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.secondary.main },
    "& .MuiOutlinedInput-root": {
      color: "#e8e8e8",
      bgcolor: "rgba(255,255,255,0.04)",
      borderRadius: 1.5,
      fontSize: "0.875rem",
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
      "&.Mui-focused fieldset": { borderColor: theme.palette.secondary.main },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: theme.palette.primary.main,
          border: `1px solid ${theme.palette.secondary.main}30`,
          borderRadius: isMobile ? 0 : 2,
          boxShadow: `0 0 60px ${theme.palette.secondary.main}20, 0 20px 60px rgba(0,0,0,0.6)`,
          display: "flex",
          flexDirection: "column",
          maxHeight: isMobile ? "100%" : "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: `${theme.palette.primary.main}cc`,
          borderBottom: `1px solid ${theme.palette.secondary.main}25`,
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#f0f0f0",
            }}
          >
            Power Tool Check
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            {tool?.name ?? "Tool"} — Daily Inspection
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent sx={{ px: 3, py: 2.5, overflowY: "auto", flexGrow: 1 }}>
        <Box display="flex" flexDirection="column" gap={2.5}>

          {/* Tool name — read-only */}
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.secondary.main}20`,
              bgcolor: "rgba(255,255,255,0.03)",
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.88rem",
                letterSpacing: "0.02em",
                color: "#f0f0f0",
              }}
            >
              {tool?.name ?? "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
              {tool?.id ?? "—"}
            </Typography>
          </Box>

          {/* Running */}
          <FormControlLabel
            control={
              <Checkbox
                checked={form.running}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, running: e.target.checked }))
                }
                size="small"
                sx={{
                  color: "rgba(255,255,255,0.3)",
                  "&.Mui-checked": { color: theme.palette.secondary.main },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: "0.875rem", color: "#e8e8e8" }}>
                Running
              </Typography>
            }
          />

          {/* Fuel level */}
          <Select
            fullWidth
            size="small"
            displayEmpty
            value={form.fuel}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fuel: e.target.value }))
            }
            sx={{
              color: form.fuel ? "#e8e8e8" : "rgba(255,255,255,0.3)",
              bgcolor: "rgba(255,255,255,0.04)",
              borderRadius: 1.5,
              fontSize: "0.875rem",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.12)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.25)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.secondary.main,
              },
            }}
          >
            <MenuItem value="" disabled>
              <Typography sx={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.3)" }}>
                Fuel Level
              </Typography>
            </MenuItem>
            {FUEL_LEVELS.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </Select>

        </Box>
      </DialogContent>

      {/* Remarks — always visible above footer, matching EngineCheckModal */}
      <Box sx={{ px: 3, pt: 1.5, pb: 1, flexShrink: 0 }}>
        <Divider sx={{ borderColor: `${theme.palette.secondary.main}20`, mb: 1.5 }} />
        <TextField
          label="Remarks"
          placeholder="Any additional observations or notes..."
          value={form.remarks}
          onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          sx={textFieldSx}
        />
      </Box>

      <Divider sx={{ borderColor: `${theme.palette.secondary.main}20`, flexShrink: 0 }} />

      {/* Footer */}
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1, flexShrink: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            color: "rgba(255,255,255,0.5)",
            borderColor: "rgba(255,255,255,0.15)",
            "&:hover": {
              borderColor: "rgba(255,255,255,0.35)",
              color: "rgba(255,255,255,0.85)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          disabled={!form.fuel}
          startIcon={<ChecklistRtlIcon />}
          sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
        >
          Submit Check
        </Button>
      </DialogActions>
    </Dialog>
  );
}
