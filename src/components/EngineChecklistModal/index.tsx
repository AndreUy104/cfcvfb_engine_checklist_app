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
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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
  batteryAVoltage: "",
  batteryBVoltage: "",
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
  const [confirmOpen, setConfirmOpen] = useState(false);
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

  useEffect(() => {
    if (!isOpen) {
      setActiveTab(0);
      setConfirmOpen(false);
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

  async function handleConfirmedSubmit() {
    if (!apparatus?.id) return;
    const success = await submitInspection(apparatus.id, form);
    if (success) {
      setConfirmOpen(false);
      onClose();
    }
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

  const uncheckedCount = form.equipmentChecks.filter(
    (eq) => eq.status === null,
  ).length;

  return (
    <>
      {/* ── Main inspection modal ── */}
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
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.4)" }}
            >
              {apparatus?.name ?? "Apparatus"} — Daily Inspection
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
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.25)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.secondary.main,
                },
              },
            }}
          />
        </Box>

        <Divider
          sx={{
            borderColor: `${theme.palette.secondary.main}20`,
            flexShrink: 0,
          }}
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
            onClick={() => setConfirmOpen(true)}
            variant="contained"
            color="secondary"
            startIcon={<ChecklistRtlIcon />}
            disabled={inspectionLoading}
            sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirmation dialog ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.primary.main,
            border: `1px solid ${theme.palette.secondary.main}30`,
            borderRadius: 2,
            boxShadow: `0 0 40px ${theme.palette.secondary.main}15, 0 16px 48px rgba(0,0,0,0.7)`,
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 2.5,
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <WarningAmberIcon
            sx={{ color: theme.palette.secondary.main, fontSize: 22 }}
          />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#f0f0f0", letterSpacing: "0.04em" }}
          >
            Submit Inspection Report?
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}
          >
            You are about to submit the daily inspection for{" "}
            <Box component="span" sx={{ color: "#f0f0f0", fontWeight: 600 }}>
              {apparatus?.name ?? "this apparatus"}
            </Box>
            .
          </Typography>

          {uncheckedCount > 0 && (
            <Alert
              severity="warning"
              sx={{
                mt: 1.5,
                bgcolor: "rgba(234,179,8,0.1)",
                color: "#fbbf24",
                border: "1px solid rgba(234,179,8,0.25)",
                fontSize: "0.8rem",
                "& .MuiAlert-icon": { color: "#fbbf24" },
              }}
            >
              {uncheckedCount} equipment item
              {uncheckedCount > 1 ? "s have" : " has"} not been checked yet.
            </Alert>
          )}

          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1.5, color: "rgba(255,255,255,0.35)" }}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            disabled={inspectionLoading}
            sx={{
              color: "rgba(255,255,255,0.5)",
              borderColor: "rgba(255,255,255,0.15)",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.35)",
                color: "rgba(255,255,255,0.85)",
              },
            }}
          >
            Go Back
          </Button>
          <Button
            onClick={handleConfirmedSubmit}
            variant="contained"
            color="secondary"
            disabled={inspectionLoading}
            startIcon={
              inspectionLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <ChecklistRtlIcon />
              )
            }
            sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
          >
            {inspectionLoading ? "Submitting..." : "Confirm & Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
