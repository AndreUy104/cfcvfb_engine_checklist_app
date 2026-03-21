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
import {
  InspectionWithDetails,
  PowerToolInspectionWithDetails,
} from "@/utilities/types/inspection.types";

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

export default function InspectionDetailModal({
  isOpen,
  onClose,
  inspection,
  type,
}: InspectionDetailModalProps) {
  if (!inspection) return null;

  const isEngine = type === "engine";
  const engineInspection = isEngine
    ? (inspection as InspectionWithDetails)
    : null;
  const toolInspection = !isEngine
    ? (inspection as PowerToolInspectionWithDetails)
    : null;

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
        {/* Common */}
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

        {/* Engine specific */}
        {isEngine && engineInspection && (
          <>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              Apparatus Checks
            </Typography>

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
              <Box>
                <InfoRow
                  label="Battery A Voltage"
                  value={`${engineInspection.battery_a_voltage}V`}
                />
                <InfoRow
                  label="Battery B Voltage"
                  value={`${engineInspection.battery_b_voltage}V`}
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

            {engineInspection.Inspection_Equipment_Results.length > 0 && (
              <>
                <Divider />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  Equipment Checks
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {engineInspection.Inspection_Equipment_Results.map(
                    (result) => (
                      <Box
                        key={result.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 1.5,
                          py: 1,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2">
                          {result.Engines_Equipment?.Equipments?.name ??
                            "Unknown"}
                        </Typography>
                        <Chip
                          label={
                            result.status === true
                              ? "Serviceable"
                              : result.status === false
                                ? "Down"
                                : "—"
                          }
                          size="small"
                          color={result.status === true ? "success" : "error"}
                        />
                      </Box>
                    ),
                  )}
                </Box>
              </>
            )}

            {engineInspection.remarks && (
              <>
                <Divider />
                <InfoRow label="Remarks" value={engineInspection.remarks} />
              </>
            )}
          </>
        )}

        {/* Power tool specific */}
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
