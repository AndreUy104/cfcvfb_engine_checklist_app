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
  FormControlLabel,
  Checkbox,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import { useTheme } from "@mui/material/styles";
import { Equipment } from "@/utilities/types/equipment.types";
import { LEVEL_OPTIONS } from "@/utilities/constants/apparatus.constant";
import { PowerToolInspectionFormData } from "@/utilities/types/inspection.types";
import { usePowerToolInspection } from "@/hooks/usePowerToolInspection";

interface PowerToolCheckModalProps {
  open: boolean;
  tool: Equipment | null;
  onClose: () => void;
}

const PHYSICAL_CONDITIONS = ["Good", "Damaged"] as const;

const INITIAL_FORM: PowerToolInspectionFormData = {
  is_running: false,
  fuel_level: "",
  physical_condition: "",
  remarks: "",
};

export default function PowerToolCheckModal({
  open,
  tool,
  onClose,
}: PowerToolCheckModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { submitInspection, loading, error } = usePowerToolInspection();
  const [form, setForm] = useState<PowerToolInspectionFormData>(INITIAL_FORM);

  function handleClose() {
    setForm(INITIAL_FORM);
    onClose();
  }

  async function handleSubmit() {
    if (!tool) return;
    const success = await submitInspection(tool.id, form);
    if (success) handleClose();
  }

  const textFieldSx = {
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
      fontSize: "0.875rem",
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
      "&.Mui-focused fieldset": { borderColor: theme.palette.secondary.main },
    },
    "& .MuiSelect-icon": { color: theme.palette.secondary.main },
    "& .MuiInputBase-input[type='date']::-webkit-calendar-picker-indicator": {
      filter: "invert(1) opacity(0.5)",
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
          {error && <Alert severity="error">{error}</Alert>}

          {/* Tool info — read only */}
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
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.4)" }}
            >
              In Service: {tool?.total_in_service ?? 0} /{" "}
              {tool?.total_quantity ?? 0}
            </Typography>
          </Box>

          {/* Running */}
          <FormControlLabel
            control={
              <Checkbox
                checked={form.is_running}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_running: e.target.checked }))
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
          <TextField
            select
            label="Fuel Level"
            value={form.fuel_level}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fuel_level: e.target.value }))
            }
            fullWidth
            variant="outlined"
            sx={textFieldSx}
          >
            <MenuItem value="" disabled sx={{ color: "rgba(255,255,255,0.3)" }}>
              Select fuel level
            </MenuItem>
            {LEVEL_OPTIONS.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>

          {/* Physical condition */}
          <TextField
            select
            label="Physical Condition"
            value={form.physical_condition}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                physical_condition: e.target.value as "Good" | "Damaged" | "",
              }))
            }
            fullWidth
            variant="outlined"
            sx={textFieldSx}
          >
            <MenuItem value="" disabled sx={{ color: "rgba(255,255,255,0.3)" }}>
              Select condition
            </MenuItem>
            {PHYSICAL_CONDITIONS.map((condition) => (
              <MenuItem key={condition} value={condition}>
                {condition}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      {/* Remarks */}
      <Box sx={{ px: 3, pt: 1.5, pb: 1, flexShrink: 0 }}>
        <Divider
          sx={{ borderColor: `${theme.palette.secondary.main}20`, mb: 1.5 }}
        />
        <TextField
          label="Remarks"
          placeholder="Any additional observations or notes..."
          value={form.remarks}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, remarks: e.target.value }))
          }
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          sx={textFieldSx}
        />
      </Box>

      <Divider
        sx={{ borderColor: `${theme.palette.secondary.main}20`, flexShrink: 0 }}
      />

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
          disabled={loading || !form.fuel_level || !form.physical_condition}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <ChecklistRtlIcon />
            )
          }
          sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
        >
          Submit Check
        </Button>
      </DialogActions>
    </Dialog>
  );
}
