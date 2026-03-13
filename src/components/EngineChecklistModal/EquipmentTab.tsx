import { Box, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Equipment } from "@/utilities/types/equipment.types";
import { EquipmentCheck, EquipmentStatus } from "@/utilities/types/engineCheck.types";
import StatusToggle from "./StatusToggle";

const equipmentStatusColors: Record<string, { bg: string; border: string; color: string }> = {
  Serviceable: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.5)", color: "#22c55e" },
  Down:        { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.5)", color: "#ef4444" },
};

interface EquipmentTabProps {
  equipmentChecks: EquipmentCheck[];
  onChange: (id: Equipment["id"], field: keyof EquipmentCheck, value: string | null) => void;
}

export default function EquipmentTab({ equipmentChecks, onChange }: EquipmentTabProps) {
  const theme = useTheme();

  const noteFieldSx = {
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.secondary.main },
    "& .MuiOutlinedInput-root": {
      color: "#e8e8e8",
      bgcolor: "rgba(255,255,255,0.03)",
      fontSize: "0.82rem",
      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&.Mui-focused fieldset": { borderColor: `${theme.palette.secondary.main}60` },
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {equipmentChecks.map((eq) => (
        <Box
          key={eq.id}
          sx={{
            py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            "&:last-child": { borderBottom: "none" },
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 0.75, sm: 0 },
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: "0.82rem" }}
            >
              {eq.name}
            </Typography>
            <StatusToggle
              options={["Serviceable", "Down"] as const}
              value={eq.status}
              onChange={(v) => onChange(eq.id, "status", v as EquipmentStatus)}
              colorMap={equipmentStatusColors}
            />
          </Box>
          <TextField
            placeholder="Notes (optional)"
            value={eq.notes}
            onChange={(e) => onChange(eq.id, "notes", e.target.value)}
            size="small"
            fullWidth
            sx={noteFieldSx}
          />
        </Box>
      ))}
    </Box>
  );
}
