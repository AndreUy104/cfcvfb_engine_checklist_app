"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  TextField,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Chip,
  Alert,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SaveIcon from "@mui/icons-material/Save";
import { useTheme } from "@mui/material/styles";
import { EngineWithType } from "@/utilities/types/engine.types";
import { EngineEquipmentWithDetails } from "@/utilities/types/engineEquipment.types";

export interface EngineEditFormData {
  status: string;
  plate_number: string;
  water_capacity: string;
}

interface ApparatusEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: EngineWithType | null;
  assignedEquipment?: EngineEquipmentWithDetails[];
  equipmentLoading?: boolean;
  onSave: (engineId: number, data: EngineEditFormData) => Promise<boolean>;
  onRemoveEquipment?: (engineEquipmentId: number) => Promise<boolean>;
  saving?: boolean;
  saveError?: string | null;
}

import { ENGINE_STATUS } from "@/utilities/constants/apparatus.constant";

// Derive values directly from the constant so this never goes out of sync
const statusColors: Record<string, string> = {
  [ENGINE_STATUS.READY]: "#22c55e",
  [ENGINE_STATUS.DOWN]: "#ef4444",
};

export default function ApparatusEditModal({
  isOpen,
  onClose,
  engine,
  assignedEquipment = [],
  equipmentLoading = false,
  onSave,
  onRemoveEquipment,
  saving = false,
  saveError = null,
}: ApparatusEditModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState(0);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Closes over theme so no explicit type parameter is needed
  const fieldSx = {
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.4)",
      fontSize: "0.82rem",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.secondary.main,
    },
    "& .MuiOutlinedInput-root": {
      color: "#e8e8e8",
      bgcolor: "rgba(255,255,255,0.04)",
      fontSize: "0.875rem",
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.secondary.main,
      },
    },
    "& .MuiSelect-icon": { color: "rgba(255,255,255,0.4)" },
    "& .MuiFormHelperText-root": { color: "#f87171" },
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EngineEditFormData>({
    defaultValues: {
      status: ENGINE_STATUS.READY,
      plate_number: "",
      water_capacity: "",
    },
  });

  // Populate form whenever the engine prop changes
  useEffect(() => {
    if (engine) {
      reset({
        status: engine.status ?? ENGINE_STATUS.READY,
        plate_number: engine.plate_number ?? "",
        water_capacity: engine.water_capacity?.toString() ?? "",
      });
    }
  }, [engine, reset]);

  // Reset UI state when the modal closes — called directly, not via an effect
  function handleClose() {
    setActiveTab(0);
    setRemovingId(null);
    onClose();
  }

  async function onSubmit(data: EngineEditFormData) {
    if (!engine?.id) return;
    const success = await onSave(engine.id, data);
    if (success) handleClose();
  }

  async function handleRemoveEquipment(engineEquipmentId: number) {
    if (!onRemoveEquipment) return;
    setRemovingId(engineEquipmentId);
    await onRemoveEquipment(engineEquipmentId);
    setRemovingId(null);
  }

  const tabSx = {
    color: "rgba(255,255,255,0.4)",
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    minHeight: 38,
    "&.Mui-selected": { color: theme.palette.secondary.main },
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: theme.palette.primary.main,
          border: `1px solid ${theme.palette.secondary.main}30`,
          borderRadius: isMobile ? 0 : 2,
          boxShadow: `0 0 60px ${theme.palette.secondary.main}15, 0 20px 60px rgba(0,0,0,0.6)`,
          display: "flex",
          flexDirection: "column",
          maxHeight: isMobile ? "100%" : "88vh",
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <EditIcon
            sx={{ color: theme.palette.secondary.main, fontSize: 18 }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#f0f0f0",
                lineHeight: 1.2,
              }}
            >
              Edit Apparatus
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.4)" }}
            >
              {engine?.name ?? "—"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: `1px solid ${theme.palette.secondary.main}20`,
          flexShrink: 0,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 2,
            minHeight: 38,
            "& .MuiTabs-indicator": {
              bgcolor: theme.palette.secondary.main,
              height: 2,
            },
          }}
        >
          <Tab label="General" sx={tabSx} />
          <Tab label={`Equipment (${assignedEquipment.length})`} sx={tabSx} />
        </Tabs>
      </Box>

      {/* Body */}
      <DialogContent sx={{ px: 3, py: 2.5, overflowY: "auto", flexGrow: 1 }}>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        {/* ── General Tab ── */}
        {activeTab === 0 && (
          <Box
            component="form"
            id="apparatus-edit-form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {/* Status */}
            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status} sx={fieldSx}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    {...field}
                    labelId="status-label"
                    label="Status"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "#1a1a2e",
                          border: "1px solid rgba(255,255,255,0.1)",
                        },
                      },
                    }}
                  >
                    {Object.values(ENGINE_STATUS).map((s) => (
                      <MenuItem key={s} value={s}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: statusColors[s],
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2" sx={{ color: "#e8e8e8" }}>
                            {s}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.status && (
                    <FormHelperText>{errors.status.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Plate Number */}
            <Controller
              name="plate_number"
              control={control}
              rules={{ required: "Plate number is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Plate Number"
                  placeholder="e.g. ABC 1234"
                  fullWidth
                  error={!!errors.plate_number}
                  helperText={errors.plate_number?.message}
                  sx={fieldSx}
                />
              )}
            />

            {/* Water Capacity */}
            <Controller
              name="water_capacity"
              control={control}
              rules={{
                required: "Water capacity is required",
                pattern: {
                  value: /^\d+$/,
                  message: "Must be a whole number",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Water Capacity (Liters)"
                  placeholder="e.g. 5000"
                  fullWidth
                  inputProps={{ inputMode: "numeric" }}
                  error={!!errors.water_capacity}
                  helperText={errors.water_capacity?.message}
                  sx={fieldSx}
                />
              )}
            />
          </Box>
        )}

        {/* ── Equipment Tab ── */}
        {activeTab === 1 && (
          <Box>
            {equipmentLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress color="secondary" size={28} />
              </Box>
            ) : assignedEquipment.length === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  py: 4,
                }}
              >
                No equipment assigned to this apparatus.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {assignedEquipment.map((eq) => (
                  <Box
                    key={eq.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      px: 1.5,
                      py: 1.25,
                      borderRadius: 1.5,
                      bgcolor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      transition: "border-color 0.15s",
                      "&:hover": { borderColor: "rgba(255,255,255,0.13)" },
                    }}
                  >
                    {/* Left: name + meta chips */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.4,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.85)",
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {eq.Equipments?.name ?? "Unknown"}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {eq.location_on_truck && (
                          <Chip
                            label={eq.location_on_truck}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              bgcolor: `${theme.palette.secondary.main}18`,
                              color: theme.palette.secondary.main,
                              border: `1px solid ${theme.palette.secondary.main}35`,
                              "& .MuiChip-label": { px: 0.75 },
                            }}
                          />
                        )}
                        {eq.quantity_assigned != null && (
                          <Chip
                            label={`×${eq.quantity_assigned}`}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              bgcolor: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.4)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              "& .MuiChip-label": { px: 0.75 },
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Right: remove button */}
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveEquipment(eq.id)}
                      disabled={removingId === eq.id}
                      sx={{
                        color: "rgba(239,68,68,0.5)",
                        flexShrink: 0,
                        "&:hover": {
                          color: "#ef4444",
                          bgcolor: "rgba(239,68,68,0.08)",
                        },
                      }}
                    >
                      {removingId === eq.id ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <DeleteOutlineIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {/* Add equipment hint */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 2,
                py: 1.25,
                px: 1.5,
                borderRadius: 1.5,
                border: `1px dashed ${theme.palette.secondary.main}30`,
                color: `${theme.palette.secondary.main}60`,
                cursor: "not-allowed",
                opacity: 0.7,
              }}
            >
              <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                Assign new equipment — coming soon
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider
        sx={{ borderColor: `${theme.palette.secondary.main}20`, flexShrink: 0 }}
      />

      {/* Footer */}
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1, flexShrink: 0 }}>
        <Button
          onClick={handleClose}
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
          type="submit"
          form="apparatus-edit-form"
          variant="contained"
          color="secondary"
          disabled={saving || activeTab === 1 || !isDirty}
          startIcon={
            saving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
