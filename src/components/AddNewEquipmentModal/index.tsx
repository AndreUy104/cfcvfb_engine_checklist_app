import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Box,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { EquipmentFormData } from "@/utilities/types/equipment.types";

interface AddNewEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNewEquipmentModal({
  isOpen,
  onClose,
}: AddNewEquipmentModalProps) {
  const theme = useTheme();
  const [form, setForm] = useState<EquipmentFormData>({
    name: "",
    total: "",
    serviceable: "",
    down: "",
    isPowerTool: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, isPowerTool: e.target.checked }));
  };

  const handleSubmit = () => {
    console.log("Submitted:", form);
    onClose();
  };

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
      open={isOpen}
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
            Add New Equipment
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            Register a new equipment to the inventory
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: "rgba(255,255,255,0.4)",
            "&:hover": { color: "#fff" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* Equipment Name */}
        <TextField
          label="Equipment Name"
          name="name"
          placeholder="e.g., SCBA Pack"
          value={form.name}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={fieldSx}
        />

        {/* Total Number */}
        <TextField
          label="Total Number"
          name="total"
          type="number"
          placeholder="e.g., 10"
          value={form.total}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          inputProps={{ min: 0 }}
          sx={fieldSx}
        />

        {/* Serviceable & Down — side by side */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Serviceable"
            name="serviceable"
            type="number"
            placeholder="e.g., 8"
            value={form.serviceable}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            inputProps={{ min: 0 }}
            sx={fieldSx}
          />
          <TextField
            label="Down / Busted"
            name="down"
            type="number"
            placeholder="e.g., 2"
            value={form.down}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            inputProps={{ min: 0 }}
            sx={fieldSx}
          />
        </Box>

        {/* Power Tool Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={form.isPowerTool}
              onChange={handleCheckbox}
              sx={{
                color: "rgba(255,255,255,0.3)",
                "&.Mui-checked": { color: theme.palette.secondary.main },
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.65)" }}
            >
              Power Tool
            </Typography>
          }
        />
      </DialogContent>

      <Divider sx={{ borderColor: `${theme.palette.secondary.main}20` }} />

      {/* Footer */}
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
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
          startIcon={<AddIcon />}
          sx={{
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          Add Equipment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
