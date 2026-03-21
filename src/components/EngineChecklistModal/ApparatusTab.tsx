import { Box, TextField, useTheme } from "@mui/material";
import {
  ApparatusChecks,
  LevelStatus,
  TwoOptionStatus,
} from "@/utilities/types/engineCheck.types";
import CheckRow from "./Checkrow";
import LevelRow from "./Levelrow";
import StatusToggle from "./StatusToggle";

const twoOptionColors: Record<
  string,
  { bg: string; border: string; color: string }
> = {
  Operational: {
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.5)",
    color: "#22c55e",
  },
  Faulty: {
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.5)",
    color: "#ef4444",
  },
};

interface ApparatusTabProps {
  checks: ApparatusChecks;
  onChange: <K extends keyof ApparatusChecks>(
    key: K,
    value: ApparatusChecks[K],
  ) => void;
}

export default function ApparatusTab({ checks, onChange }: ApparatusTabProps) {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <LevelRow
        label="Water Level"
        value={checks.waterLevel}
        onChange={(v) => onChange("waterLevel", v as LevelStatus)}
      />
      <LevelRow
        label="Fuel Level"
        value={checks.fuelLevel}
        onChange={(v) => onChange("fuelLevel", v as LevelStatus)}
      />
      <CheckRow label="Lights & Siren">
        <StatusToggle
          options={["Operational", "Faulty"] as const}
          value={checks.lightsAndSiren}
          onChange={(v) => onChange("lightsAndSiren", v as TwoOptionStatus)}
          colorMap={twoOptionColors}
        />
      </CheckRow>
      <CheckRow label="Battery A Voltage">
        <TextField
          size="small"
          placeholder="e.g. 12.6V"
          value={checks.batteryAVoltage}
          onChange={(e) => onChange("batteryAVoltage", e.target.value)}
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
      </CheckRow>
      <CheckRow label="Battery B Voltage">
        <TextField
          size="small"
          placeholder="e.g. 12.6V"
          value={checks.batteryBVoltage}
          onChange={(e) => onChange("batteryBVoltage", e.target.value)}
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
      </CheckRow>
      <CheckRow label="Communication Radio">
        <StatusToggle
          options={["Operational", "Faulty"] as const}
          value={checks.communicationRadio}
          onChange={(v) => onChange("communicationRadio", v as TwoOptionStatus)}
          colorMap={twoOptionColors}
        />
      </CheckRow>
    </Box>
  );
}
