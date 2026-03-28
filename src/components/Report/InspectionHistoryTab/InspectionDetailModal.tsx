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
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import {
  InspectionWithDetails,
  PowerToolInspectionWithDetails,
} from "@/utilities/types/inspection.types";
import { normalizeCompartment } from "@/utilities/helper/equipmentGrouping";

interface InspectionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: InspectionWithDetails | PowerToolInspectionWithDetails | null;
  type: "engine" | "powerTool";
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={700}
      sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
    >
      {label}
    </Typography>
    <Typography variant="body2">{value ?? "—"}</Typography>
  </Box>
);

const StatusChip = ({
  value,
  goodValue,
}: {
  value: string | null;
  goodValue: string;
}) => (
  <Chip
    label={value ?? "—"}
    size="small"
    color={value === goodValue ? "success" : "error"}
  />
);

type EquipmentResult =
  InspectionWithDetails["Inspection_Equipment_Results"][number];

interface CompartmentResultGroup {
  label: string;
  normalized: string;
  entries: EquipmentResult[];
}

function groupResultsByCompartment(
  results: EquipmentResult[],
): CompartmentResultGroup[] {
  const map = new Map<string, CompartmentResultGroup>();
  for (const result of results) {
    const location = result.Engines_Equipment?.location_on_truck ?? null;
    const key = normalizeCompartment(location);
    const existing = map.get(key);
    if (existing) {
      existing.entries.push(result);
    } else {
      map.set(key, {
        label: location?.trim() ?? "No compartment",
        normalized: key,
        entries: [result],
      });
    }
  }
  return Array.from(map.values());
}

export default function InspectionDetailModal({
  isOpen,
  onClose,
  inspection,
  type,
}: InspectionDetailModalProps) {
  const theme = useTheme();

  if (!inspection) return null;

  const isEngine = type === "engine";
  const engineInspection = isEngine
    ? (inspection as InspectionWithDetails)
    : null;
  const toolInspection = !isEngine
    ? (inspection as PowerToolInspectionWithDetails)
    : null;

  const equipmentGroups = engineInspection
    ? groupResultsByCompartment(
        engineInspection.Inspection_Equipment_Results ?? [],
      )
    : [];

  const sectionLabelSx = {
    variant: "caption" as const,
    color: "text.secondary",
    fontWeight: 700,
    sx: { textTransform: "uppercase" as const, letterSpacing: "0.08em" },
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            fontWeight={700}
            sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
          >
            Inspection Details
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isEngine
              ? engineInspection?.Engines?.name
              : toolInspection?.Equipments?.name}{" "}
            — #{inspection.id}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}
      >
        {/* ── Common: inspector + date ── */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <InfoRow label="Inspected By" value={inspection.Users?.name} />
          <InfoRow
            label="Date & Time"
            value={new Date(
              isEngine
                ? (inspection as InspectionWithDetails).inspected_at
                : (inspection as PowerToolInspectionWithDetails).created_at,
            ).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        </Box>

        <Divider />

        {/* ── Engine-specific ── */}
        {isEngine && engineInspection && (
          <>
            {/* Apparatus checks */}
            <Typography {...sectionLabelSx}>Apparatus Checks</Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <InfoRow
                label="Water Level"
                value={engineInspection.water_level}
              />
              <InfoRow label="Fuel Level" value={engineInspection.fuel_level} />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
                >
                  Lights & Siren
                </Typography>
                <Box mt={0.5}>
                  <StatusChip
                    value={engineInspection.lights_and_siren}
                    goodValue="Operational"
                  />
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                <InfoRow
                  label="Battery A Voltage"
                  value={
                    engineInspection.battery_a_voltage
                      ? `${engineInspection.battery_a_voltage}V`
                      : null
                  }
                />
                <InfoRow
                  label="Battery B Voltage"
                  value={
                    engineInspection.battery_b_voltage
                      ? `${engineInspection.battery_b_voltage}V`
                      : null
                  }
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
                >
                  Radio
                </Typography>
                <Box mt={0.5}>
                  <StatusChip
                    value={engineInspection.radio_status}
                    goodValue="Operational"
                  />
                </Box>
              </Box>
            </Box>

            {/* Equipment checks — grouped by compartment */}
            {equipmentGroups.length > 0 && (
              <>
                <Divider />
                <Typography {...sectionLabelSx}>Equipment Checks</Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {equipmentGroups.map((group, groupIdx, arr) => (
                    <Box
                      key={group.normalized}
                      sx={{
                        pb: groupIdx < arr.length - 1 ? 2 : 0,
                        borderBottom:
                          groupIdx < arr.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      {/* Compartment header */}
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                          color: theme.palette.secondary.main,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          display: "block",
                          mb: 0.75,
                          fontSize: "0.68rem",
                        }}
                      >
                        {group.label}
                      </Typography>

                      {/* Equipment rows */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        {group.entries.map((result) => (
                          <Box
                            key={result.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                              px: 1.5,
                              py: 1,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor:
                                result.status === true
                                  ? "success.main"
                                  : result.status === false
                                    ? "error.main"
                                    : "divider",
                              bgcolor:
                                result.status === true
                                  ? "rgba(34,197,94,0.05)"
                                  : result.status === false
                                    ? "rgba(239,68,68,0.05)"
                                    : "transparent",
                            }}
                          >
                            {/* Name + quantity */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {result.Engines_Equipment?.Equipments?.name ??
                                  "Unknown"}
                              </Typography>
                              {result.Engines_Equipment?.quantity_assigned !=
                                null && (
                                <Chip
                                  label={`×${result.Engines_Equipment.quantity_assigned}`}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                            </Box>

                            {/* Status chip */}
                            <Chip
                              label={
                                result.status === true
                                  ? "Serviceable"
                                  : result.status === false
                                    ? "Down"
                                    : "Not checked"
                              }
                              size="small"
                              color={
                                result.status === true
                                  ? "success"
                                  : result.status === false
                                    ? "error"
                                    : "default"
                              }
                              sx={{ flexShrink: 0 }}
                            />
                          </Box>
                        ))}
                      </Box>

                      {/* Per-compartment notes if any result has notes */}
                      {group.entries.some((r) => r.notes) && (
                        <Box
                          sx={{
                            mt: 0.75,
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.25,
                          }}
                        >
                          {group.entries
                            .filter((r) => r.notes)
                            .map((r) => (
                              <Typography
                                key={r.id}
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                              >
                                {r.Engines_Equipment?.Equipments?.name}:{" "}
                                {r.notes}
                              </Typography>
                            ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {/* Remarks */}
            {engineInspection.remarks && (
              <>
                <Divider />
                <InfoRow label="Remarks" value={engineInspection.remarks} />
              </>
            )}
          </>
        )}

        {/* ── Power tool specific ── */}
        {!isEngine && toolInspection && (
          <>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
                >
                  Running
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={toolInspection.is_running ? "Yes" : "No"}
                    size="small"
                    color={toolInspection.is_running ? "success" : "error"}
                  />
                </Box>
              </Box>
              <InfoRow label="Fuel Level" value={toolInspection.fuel_level} />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
                >
                  Physical Condition
                </Typography>
                <Box mt={0.5}>
                  <StatusChip
                    value={toolInspection.physical_condition}
                    goodValue="Good"
                  />
                </Box>
              </Box>
            </Box>

            {toolInspection.remarks && (
              <>
                <Divider />
                <InfoRow label="Remarks" value={toolInspection.remarks} />
              </>
            )}
          </>
        )}
      </DialogContent>

      <Divider />
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
