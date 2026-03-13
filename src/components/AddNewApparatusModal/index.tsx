import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Typography,
  IconButton,
  Box,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { ApparatusFormData } from "@/utilities/types/apparatus.types";
import { APPARATUS_TYPES } from "@/utilities/constants/apparatus.constant";

interface ApparatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNewApparatusModal({ isOpen, onClose }: ApparatusModalProps) {
  const theme = useTheme();
  const [form, setForm] = useState<ApparatusFormData>({
    name: "",
    type: "",
    waterCapacity: "",
    licensePlate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log("Submitted:", form);
    onClose()
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
    "& .MuiSelect-icon": { color: theme.palette.secondary.main },
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
            Add New Apparatus
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            Register a new vehicle to the fleet
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
        sx={{ px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        <TextField
          label="Apparatus Name"
          name="name"
          placeholder="e.g., Engine 8"
          value={form.name}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={fieldSx}
        />

        <TextField
          select
          label="Apparatus Type"
          name="type"
          value={form.type}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={fieldSx}
        >
          <MenuItem value="" disabled sx={{ color: "rgba(255,255,255,0.3)" }}>
            Select vehicle type
          </MenuItem>
          {APPARATUS_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Water Capacity (Ton)"
          name="waterCapacity"
          type="number"
          placeholder="e.g., 500"
          value={form.waterCapacity}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          inputProps={{ min: 0 }}
          sx={fieldSx}
        />

        <TextField
          label="License Plate"
          name="licensePlate"
          placeholder="Enter identification number"
          value={form.licensePlate}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={fieldSx}
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
          Add Apparatus
        </Button>
      </DialogActions>
    </Dialog>
  );
}
