/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Divider,
  Tab,
  Tabs,
  TextField,
  useMediaQuery,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import { useTheme } from "@mui/material/styles";
import { Tables } from "@/utilities/types/database";
import {
  ApparatusChecks,
  EngineCheckFormData,
  EquipmentCheck,
} from "@/utilities/types/engineCheck.types";
import ApparatusTab from "./ApparatusTab";
import EquipmentTab from "./EquipmentTab";
import { EngineEquipmentWithDetails } from "@/utilities/types/engineEquipment.types";
import { useInspection } from "@/hooks/useInspection";

interface EngineCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  apparatus?: Pick<Tables<"Engines">, "id" | "name">;
  assignedEquipment?: EngineEquipmentWithDetails[];
  equipmentLoading?: boolean;
}

const DEFAULT_APPARATUS_CHECKS: ApparatusChecks = {
  waterLevel: "Empty",
  fuelLevel: "Empty",
  lightsAndSiren: null,
  batteryStatus: null,
  communicationRadio: null,
};

export default function EngineCheckModal({
  isOpen,
  onClose,
  apparatus,
  assignedEquipment = [],
  equipmentLoading = false,
}: EngineCheckModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab, setActiveTab] = useState(0);
  const {
    submitInspection,
    loading: inspectionLoading,
    error: inspectionError,
  } = useInspection();

  const [form, setForm] = useState<EngineCheckFormData>({
    apparatusChecks: DEFAULT_APPARATUS_CHECKS,
    equipmentChecks: [],
    remarks: "",
  });

  // Rebuild equipment checks when assignedEquipment changes.
  // Each EngineEquipmentWithDetails row (which maps to one compartment entry)
  // becomes its own EquipmentCheck so the inspector verifies every
  // compartment slot individually.
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      equipmentChecks: assignedEquipment.map(
        (ae): EquipmentCheck => ({
          engineEquipmentId: ae.id,
          name: ae.Equipments?.name ?? "Unknown Equipment",
          quantity_assigned: ae.quantity_assigned ?? null,
          location_on_truck: ae.location_on_truck ?? null,
          status: null,
          notes: "",
        }),
      ),
    }));
  }, [assignedEquipment]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab(0);
      setForm({
        apparatusChecks: DEFAULT_APPARATUS_CHECKS,
        equipmentChecks: [],
        remarks: "",
      });
    }
  }, [isOpen]);

  function handleApparatusChange<K extends keyof ApparatusChecks>(
    key: K,
    value: ApparatusChecks[K],
  ) {
    setForm((prev) => ({
      ...prev,
      apparatusChecks: { ...prev.apparatusChecks, [key]: value },
    }));
  }

  function handleEquipmentChange(
    engineEquipmentId: EquipmentCheck["engineEquipmentId"],
    field: "status" | "notes",
    value: string | null,
  ) {
    setForm((prev) => ({
      ...prev,
      equipmentChecks: prev.equipmentChecks.map((eq) =>
        eq.engineEquipmentId === engineEquipmentId
          ? { ...eq, [field]: value }
          : eq,
      ),
    }));
  }

  async function handleSubmit() {
    if (!apparatus?.id) return;
    const success = await submitInspection(apparatus.id, form);
    if (success) onClose();
  }

  const tabSx = {
    color: "rgba(255,255,255,0.4)",
    fontWeight: 600,
    fontSize: "0.78rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    minHeight: 40,
    "&.Mui-selected": { color: theme.palette.secondary.main },
  };

  // Derive a count of unchecked equipment rows to surface on the tab label
  const uncheckedCount = form.equipmentChecks.filter(
    (eq) => eq.status === null,
  ).length;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
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
            Engine Check
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            {apparatus?.name ?? "Apparatus"} — Daily Inspection
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
            minHeight: 40,
            "& .MuiTabs-indicator": {
              bgcolor: theme.palette.secondary.main,
              height: 2,
            },
          }}
        >
          <Tab label="Apparatus" sx={tabSx} />
          <Tab
            label={
              uncheckedCount > 0 && !equipmentLoading
                ? `Equipment (${uncheckedCount} remaining)`
                : "Equipment"
            }
            sx={tabSx}
          />
        </Tabs>
      </Box>

      {/* Body */}
      <DialogContent sx={{ px: 3, py: 2, overflowY: "auto", flexGrow: 1 }}>
        {inspectionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {inspectionError}
          </Alert>
        )}
        {activeTab === 0 && (
          <ApparatusTab
            checks={form.apparatusChecks}
            onChange={handleApparatusChange}
          />
        )}
        {activeTab === 1 &&
          (equipmentLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={6}
            >
              <CircularProgress color="secondary" size={32} />
            </Box>
          ) : (
            <EquipmentTab
              equipmentChecks={form.equipmentChecks}
              onChange={handleEquipmentChange}
            />
          ))}
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
          sx={{
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
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.secondary.main,
              },
            },
          }}
        />
      </Box>

      <Divider
        sx={{ borderColor: `${theme.palette.secondary.main}20`, flexShrink: 0 }}
      />

      {/* Footer */}
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1, flexShrink: 0 }}>
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
          startIcon={
            inspectionLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <ChecklistRtlIcon />
            )
          }
          disabled={inspectionLoading}
          sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
        >
          Submit Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}
