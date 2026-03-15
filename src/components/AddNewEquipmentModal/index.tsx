import { useState } from "react"
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, IconButton,
  Box, Divider, FormControlLabel, Checkbox, Alert,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import AddIcon from "@mui/icons-material/Add"
import { useTheme } from "@mui/material/styles"
import { EquipmentFormData } from "@/utilities/types/equipment.types"
import { useEquipment } from "@/hooks/useEquipment"

interface AddNewEquipmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DEFAULT_FORM: EquipmentFormData = {
  name: "",
  total_quantity: "",
  total_in_service: "",
  total_down: "",
  is_power_tool: false,
}

export default function AddNewEquipmentModal({
  isOpen,
  onClose,
  onSuccess,
}: AddNewEquipmentModalProps) {
  const theme = useTheme()
  const { createEquipment, loading, error } = useEquipment()
  const [form, setForm] = useState<EquipmentFormData>(DEFAULT_FORM)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, is_power_tool: e.target.checked }))
  }

  async function handleSubmit() {
    await createEquipment({
      name: form.name,
      total_quantity: form.total_quantity === "" ? null : Number(form.total_quantity),
      total_in_service: form.total_in_service === "" ? null : Number(form.total_in_service),
      total_down: form.total_down === "" ? null : Number(form.total_down),
      is_power_tool: form.is_power_tool,
    })
    if (!error) handleClose()
    onSuccess?.()
  }

  function handleClose() {
    setForm(DEFAULT_FORM)
    onClose()
  }

  const fieldSx = {
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontWeight: 600 },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.secondary.main },
    "& .MuiOutlinedInput-root": {
      color: "#e8e8e8",
      bgcolor: "rgba(255,255,255,0.04)",
      borderRadius: 1.5,
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
      "&.Mui-focused fieldset": { borderColor: theme.palette.secondary.main },
    },
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
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
      <DialogTitle
        sx={{
          bgcolor: `${theme.palette.primary.main}cc`,
          borderBottom: `1px solid ${theme.palette.secondary.main}25`,
          px: 3, py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#f0f0f0" }}>
            Add New Equipment
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            Register a new equipment to the inventory
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}

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

        <TextField
          label="Total Quantity"
          name="total_quantity"
          type="number"
          placeholder="e.g., 10"
          value={form.total_quantity}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          inputProps={{ min: 0 }}
          sx={fieldSx}
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="In Service"
            name="total_in_service"
            type="number"
            placeholder="e.g., 8"
            value={form.total_in_service}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            inputProps={{ min: 0 }}
            sx={fieldSx}
          />
          <TextField
            label="Down / Busted"
            name="total_down"
            type="number"
            placeholder="e.g., 2"
            value={form.total_down}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            inputProps={{ min: 0 }}
            sx={fieldSx}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={form.is_power_tool}
              onChange={handleCheckbox}
              sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: theme.palette.secondary.main } }}
            />
          }
          label={<Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>Power Tool</Typography>}
        />
      </DialogContent>

      <Divider sx={{ borderColor: `${theme.palette.secondary.main}20` }} />

      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.15)", "&:hover": { borderColor: "rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.85)" } }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          disabled={loading || !form.name}
          sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
        >
          Add Equipment
        </Button>
      </DialogActions>
    </Dialog>
  )
}
