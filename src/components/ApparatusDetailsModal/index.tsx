"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import OpacityIcon from "@mui/icons-material/Opacity";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useState } from "react";
import { EngineWithType } from "@/utilities/types/engine.types";
import { EngineEquipmentWithDetails } from "@/utilities/types/engineEquipment.types";
import { InspectionWithDetails } from "@/utilities/types/inspection.types";

interface ApparatusViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: EngineWithType | null;
  assignedEquipment?: EngineEquipmentWithDetails[];
  equipmentLoading?: boolean;
  lastInspection?: InspectionWithDetails | null;
  inspectionLoading?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  ready: {
    label: "Ready",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.35)",
  },
  progress: {
    label: "In Progress",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.35)",
  },
  alert: {
    label: "Alert",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.35)",
  },
};

function groupEquipmentByCompartment(
  equipment: EngineEquipmentWithDetails[],
): Map<string, EngineEquipmentWithDetails[]> {
  const map = new Map<string, EngineEquipmentWithDetails[]>();
  for (const eq of equipment) {
    const key = eq.location_on_truck?.trim() ?? "No compartment";
    const existing = map.get(key);
    if (existing) existing.push(eq);
    else map.set(key, [eq]);
  }
  return map;
}

export default function ApparatusDetailsModal({
  isOpen,
  onClose,
  engine,
  assignedEquipment = [],
  equipmentLoading = false,
  lastInspection = null,
  inspectionLoading = false,
}: ApparatusViewModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState(0);

  const status = engine?.status ?? "ready";
  const statusCfg = statusConfig[status] ?? statusConfig.ready;
  const compartmentMap = groupEquipmentByCompartment(assignedEquipment);

  // ── Derive display values from InspectionWithDetails ──────────────────────
  const inspectedDate = lastInspection?.inspected_at
    ? new Date(lastInspection.inspected_at).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const submittedBy = lastInspection?.Users?.name ?? "Unknown";

  const uncheckedCount =
    lastInspection?.Inspection_Equipment_Results?.filter(
      (r) => r.status === null,
    ).length ?? 0;

  const remarks = lastInspection?.remarks ?? "";

  const tabSx = {
    color: "rgba(255,255,255,0.4)",
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    minHeight: 38,
    "&.Mui-selected": { color: theme.palette.secondary.main },
  };

  const metaItemSx = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    py: 1.25,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };

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
          <LocalFireDepartmentIcon
            sx={{ color: theme.palette.secondary.main, fontSize: 20 }}
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
              {engine?.name ?? "Apparatus"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.4)" }}
            >
              {engine?.Engine_type?.type ?? "—"} · Apparatus Details
            </Typography>
          </Box>
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
            minHeight: 38,
            "& .MuiTabs-indicator": {
              bgcolor: theme.palette.secondary.main,
              height: 2,
            },
          }}
        >
          <Tab label="Details" sx={tabSx} />
          <Tab label={`Equipment (${assignedEquipment.length})`} sx={tabSx} />
          <Tab label="Last Inspection" sx={tabSx} />
        </Tabs>
      </Box>

      {/* Body */}
      <DialogContent sx={{ px: 3, py: 2, overflowY: "auto", flexGrow: 1 }}>
        {/* ── Details Tab ── */}
        {activeTab === 0 && (
          <Box>
            {/* Status banner */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                mb: 2,
                borderRadius: 1.5,
                bgcolor: statusCfg.bg,
                border: `1px solid ${statusCfg.border}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                }}
              >
                Current Status
              </Typography>
              <Chip
                label={statusCfg.label}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: statusCfg.bg,
                  color: statusCfg.color,
                  border: `1px solid ${statusCfg.border}`,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </Box>

            {/* Meta fields */}
            <Box>
              <Box sx={metaItemSx}>
                <DirectionsCarIcon
                  sx={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "0.68rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Plate Number
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#e8e8e8", fontWeight: 600, mt: 0.25 }}
                  >
                    {engine?.plate_number ?? "—"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={metaItemSx}>
                <OpacityIcon
                  sx={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "0.68rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Water Capacity
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#e8e8e8", fontWeight: 600, mt: 0.25 }}
                  >
                    {engine?.water_capacity
                      ? `${engine.water_capacity} L`
                      : "—"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ ...metaItemSx, borderBottom: "none" }}>
                <InventoryIcon
                  sx={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "0.68rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Total Equipment Assigned
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#e8e8e8", fontWeight: 600, mt: 0.25 }}
                  >
                    {assignedEquipment.length} item
                    {assignedEquipment.length !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>
            </Box>
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
              Array.from(compartmentMap.entries()).map(
                ([compartment, items], idx, arr) => (
                  <Box
                    key={compartment}
                    sx={{
                      pb: 1.5,
                      mb: 1.5,
                      borderBottom:
                        idx < arr.length - 1
                          ? "1px solid rgba(255,255,255,0.07)"
                          : "none",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.secondary.main,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        display: "block",
                        mb: 0.75,
                      }}
                    >
                      {compartment}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      {items.map((eq) => (
                        <Box
                          key={eq.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                            bgcolor: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(255,255,255,0.75)",
                              fontSize: "0.82rem",
                            }}
                          >
                            {eq.Equipments?.name ?? "Unknown"}
                          </Typography>
                          {eq.quantity_assigned != null && (
                            <Chip
                              label={`×${eq.quantity_assigned}`}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "0.66rem",
                                fontWeight: 700,
                                bgcolor: "rgba(255,255,255,0.06)",
                                color: "rgba(255,255,255,0.4)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                "& .MuiChip-label": { px: 0.75 },
                              }}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ),
              )
            )}
          </Box>
        )}

        {/* ── Last Inspection Tab ── */}
        {activeTab === 2 && (
          <Box>
            {inspectionLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress color="secondary" size={28} />
              </Box>
            ) : !lastInspection ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AssignmentIcon
                  sx={{ color: "rgba(255,255,255,0.15)", fontSize: 40 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.3)" }}
                >
                  No inspection records found.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Date + submitted by */}
                <Grid container spacing={1.5}>
                  {[
                    { label: "Date", value: inspectedDate ?? "—" },
                    { label: "Submitted By", value: submittedBy },
                  ].map((item) => (
                    <Grid key={item.label} size={{ xs: 6 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.35)",
                            fontSize: "0.68rem",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#e8e8e8",
                            fontWeight: 600,
                            mt: 0.25,
                            fontSize: "0.82rem",
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Unchecked equipment warning */}
                {uncheckedCount > 0 && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#f87171", fontSize: "0.8rem" }}
                    >
                      {uncheckedCount} equipment item
                      {uncheckedCount > 1 ? "s were" : " was"} not checked
                      during this inspection.
                    </Typography>
                  </Box>
                )}

                {/* Remarks */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "0.68rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      display: "block",
                      mb: 0.75,
                    }}
                  >
                    Remarks
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      minHeight: 60,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: remarks
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(255,255,255,0.25)",
                        fontSize: "0.82rem",
                        fontStyle: remarks ? "normal" : "italic",
                        lineHeight: 1.6,
                      }}
                    >
                      {remarks || "No remarks recorded."}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider
        sx={{ borderColor: `${theme.palette.secondary.main}20`, flexShrink: 0 }}
      />
      <DialogActions sx={{ px: 3, py: 1.5, flexShrink: 0 }}>
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
