import { Box, Chip, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  EquipmentCheck,
  EquipmentStatus,
} from "@/utilities/types/engineCheck.types";
import StatusToggle from "./StatusToggle";
import { groupByCompartment } from "@/utilities/helper/equipmentGrouping";

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

  const groups = groupByCompartment(equipmentChecks);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {groups.map((group, groupIdx) => (
        <Box
          key={group.normalized}
          sx={{
            py: 1.5,
            borderBottom:
              groupIdx < groups.length - 1
                ? "1px solid rgba(255,255,255,0.1)"
                : "none",
          }}
        >
          {/* Compartment header */}
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.secondary.main,
              fontWeight: 700,
              fontSize: "0.84rem",
              mb: 1,
              textTransform: "capitalize",
            }}
          >
            {group.label}
          </Typography>

          {/* One row per equipment entry in this compartment */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {group.entries.map((eq) => (
              <Box
                key={eq.engineEquipmentId}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                  pl: 1.5,
                  borderLeft: `2px solid ${theme.palette.secondary.main}25`,
                }}
              >
                {/* Equipment name + status toggle */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Left: name + quantity */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.6,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      {eq.name}
                    </Typography>
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
