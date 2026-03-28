"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Equipment, EquipmentUpdate } from "@/utilities/types/equipment.types";

type EquipmentStatus = "operational" | "partial" | "down";

interface EditPowerToolModalProps {
  open: boolean;
  tool: Equipment | null;
  onClose: () => void;
  onSave: (id: number, data: EquipmentUpdate) => Promise<boolean>;
}

const STATUS_OPTIONS: {
  value: EquipmentStatus;
  label: string;
  color: string;
}[] = [
  { value: "operational", label: "Operational", color: "#22c55e" },
  { value: "partial", label: "Partial", color: "#f59e0b" },
  { value: "down", label: "Down", color: "#ef4444" },
];

export default function EditPowerToolModal({
  open,
  tool,
  onClose,
  onSave,
}: EditPowerToolModalProps) {
  const theme = useTheme();

  function deriveStatus(t: Equipment): EquipmentStatus {
    const down = t.total_down ?? 0;
    const total = t.total_quantity ?? 0;
    if (down === 0) return "operational";
    if (down >= total) return "down";
    return "partial";
  }

  function toolToForm(t: Equipment) {
    return {
      name: t.name ?? "",
      quantity: t.total_quantity ?? 0,
      status: deriveStatus(t),
      nameError: "",
      qtyError: "",
    };
  }

  const [form, setForm] = useState(() =>
    tool
      ? toolToForm(tool)
      : {
          name: "",
          quantity: 0,
          status: "operational" as EquipmentStatus,
          nameError: "",
          qtyError: "",
        },
  );
  const [saving, setSaving] = useState(false);

  function statusToDown(s: EquipmentStatus, total: number): number {
    if (s === "operational") return 0;
    if (s === "down") return total;
    const existing = tool?.total_down ?? 1;
    return Math.min(Math.max(existing, 1), total - 1) || 1;
  }

  function validate(): boolean {
    let nameError = "";
    let qtyError = "";
    if (!form.name.trim()) nameError = "Name is required.";
    if (form.quantity < 1) qtyError = "Quantity must be at least 1.";
    if (nameError || qtyError) {
      setForm((f) => ({ ...f, nameError, qtyError }));
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!tool || !validate()) return;
    setSaving(true);

    const total_down = statusToDown(form.status, form.quantity);
    const total_in_service = Math.max(form.quantity - total_down, 0);

    const success = await onSave(tool.id, {
      name: form.name,
      total_quantity: form.quantity,
      total_down,
      total_in_service,
    });

    setSaving(false);
    if (success) onClose();
  }

  const fieldSx = {
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.5)",
      fontWeight: 600,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.secondary.main,
    },
    "& .MuiOutlinedInput-root": {
      color: "#e8e8e8",
      bgcolor: "rgba(255,255,255,0.04)",
      borderRadius: 1.5,
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
      "&.Mui-focused fieldset": { borderColor: theme.palette.secondary.main },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.primary.main,
          border: `1px solid ${theme.palette.secondary.main}30`,
          borderRadius: 2,
          boxShadow: `0 0 60px ${theme.palette.secondary.main}20, 0 20px 60px rgba(0,0,0,0.6)`,
        },
      }}
    >
      {/* ── Title ── */}
      <DialogTitle
        sx={{
          bgcolor: `${theme.palette.primary.main}cc`,
          borderBottom: `1px solid ${theme.palette.secondary.main}25`,
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            Edit Power Tool
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            #{tool?.id} — {tool?.name}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Fields ── */}
      <DialogContent
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* Name */}
        <TextField
          label="Tool Name"
          value={form.name}
          onChange={(e) =>
            setForm((f) => ({ ...f, name: e.target.value, nameError: "" }))
          }
          error={!!form.nameError}
          helperText={form.nameError}
          fullWidth
          variant="outlined"
          inputProps={{ maxLength: 100 }}
          sx={fieldSx}
        />

        {/* Quantity */}
        <TextField
          label="Total Quantity"
          type="number"
          value={form.quantity}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              quantity: Number(e.target.value),
              qtyError: "",
            }))
          }
          error={!!form.qtyError}
          helperText={form.qtyError}
          fullWidth
          variant="outlined"
          inputProps={{ min: 1 }}
          sx={fieldSx}
        />

        {/* Status */}
        <TextField
          select
          label="Status"
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              status: e.target.value as EquipmentStatus,
            }))
          }
          fullWidth
          variant="outlined"
          sx={fieldSx}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              <Stack direction="row" alignItems="center" gap={1}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: opt.color,
                    boxShadow: `0 0 5px ${opt.color}`,
                    display: "inline-block",
                  }}
                />
                {opt.label}
              </Stack>
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <Divider sx={{ borderColor: `${theme.palette.secondary.main}20` }} />

      {/* ── Actions ── */}
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={saving}
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
          onClick={handleSave}
          variant="contained"
          color="secondary"
          startIcon={<SaveOutlinedIcon />}
          disabled={saving || !form.name.trim()}
          sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
