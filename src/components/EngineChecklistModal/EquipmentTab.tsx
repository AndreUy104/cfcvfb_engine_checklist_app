import { Box, Chip, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  EquipmentCheck,
  EquipmentStatus,
} from "@/utilities/types/engineCheck.types";
import StatusToggle from "./StatusToggle";

const equipmentStatusColors: Record<
  string,
  { bg: string; border: string; color: string }
> = {
  Serviceable: {
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.5)",
    color: "#22c55e",
  },
  Down: {
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.5)",
    color: "#ef4444",
  },
};

interface EquipmentTabProps {
  equipmentChecks: EquipmentCheck[];
  onChange: (
    engineEquipmentId: EquipmentCheck["engineEquipmentId"],
    field: "status" | "notes",
    value: string | null,
  ) => void;
}
interface EquipmentGroup {
  name: string;
  entries: EquipmentCheck[];
}

function groupByName(checks: EquipmentCheck[]): EquipmentGroup[] {
  const map = new Map<string, EquipmentCheck[]>();
  for (const check of checks) {
    const existing = map.get(check.name);
    if (existing) {
      existing.push(check);
    } else {
      map.set(check.name, [check]);
    }
  }
  return Array.from(map.entries()).map(([name, entries]) => ({
    name,
    entries,
  }));
}

export default function EquipmentTab({
  equipmentChecks,
  onChange,
}: EquipmentTabProps) {
  const theme = useTheme();

  const noteFieldSx = {
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.35)",
      fontSize: "0.8rem",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.secondary.main,
    },
    "& .MuiOutlinedInput-root": {
      color: "#e8e8e8",
      bgcolor: "rgba(255,255,255,0.03)",
      fontSize: "0.82rem",
      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&.Mui-focused fieldset": {
        borderColor: `${theme.palette.secondary.main}60`,
      },
    },
  };

  if (equipmentChecks.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.3)", textAlign: "center", py: 4 }}
      >
        No equipment assigned to this apparatus.
      </Typography>
    );
  }

  const groups = groupByName(equipmentChecks);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {groups.map((group, groupIdx) => (
        <Box
          key={group.name}
          sx={{
            py: 1.5,
            borderBottom:
              groupIdx < groups.length - 1
                ? "1px solid rgba(255,255,255,0.1)"
                : "none",
          }}
        >
          {/* Equipment name header — shown once per group */}
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.85)",
              fontWeight: 700,
              fontSize: "0.84rem",
              mb: group.entries.length > 1 ? 1 : 0.75,
            }}
          >
            {group.name}
          </Typography>

          {/* One row per compartment entry */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {group.entries.map((eq) => (
              <Box
                key={eq.engineEquipmentId}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                  pl: group.entries.length > 1 ? 1.5 : 0,
                  borderLeft:
                    group.entries.length > 1
                      ? `2px solid ${theme.palette.secondary.main}25`
                      : "none",
                }}
              >
                {/* Compartment meta + status toggle on the same line */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Left: qty + location chips */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.6,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {eq.location_on_truck ? (
                      <Chip
                        label={eq.location_on_truck}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          bgcolor: `${theme.palette.secondary.main}18`,
                          color: theme.palette.secondary.main,
                          border: `1px solid ${theme.palette.secondary.main}35`,
                          "& .MuiChip-label": { px: 0.9 },
                        }}
                      />
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255,255,255,0.25)",
                          fontSize: "0.7rem",
                          fontStyle: "italic",
                        }}
                      >
                        No compartment
                      </Typography>
                    )}
                    {eq.quantity_assigned != null && (
                      <Chip
                        label={`×${eq.quantity_assigned}`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          bgcolor: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.4)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          "& .MuiChip-label": { px: 0.9 },
                        }}
                      />
                    )}
                  </Box>

                  {/* Right: Serviceable / Down toggle */}
                  <StatusToggle
                    options={["Serviceable", "Down"] as const}
                    value={eq.status}
                    onChange={(v) =>
                      onChange(
                        eq.engineEquipmentId,
                        "status",
                        v as EquipmentStatus,
                      )
                    }
                    colorMap={equipmentStatusColors}
                  />
                </Box>

                {/* Notes */}
                <TextField
                  placeholder="Notes (optional)"
                  value={eq.notes}
                  onChange={(e) =>
                    onChange(eq.engineEquipmentId, "notes", e.target.value)
                  }
                  size="small"
                  fullWidth
                  sx={noteFieldSx}
                />
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
