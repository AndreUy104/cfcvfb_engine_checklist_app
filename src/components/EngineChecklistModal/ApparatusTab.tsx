import { Box } from "@mui/material";
import {
  ApparatusChecks,
  LevelStatus,
  TwoOptionStatus,
  ThreeOptionStatus,
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

const batteryColors: Record<
  string,
  { bg: string; border: string; color: string }
> = {
  Good: {
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.5)",
    color: "#22c55e",
  },
  Weak: {
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.5)",
    color: "#f59e0b",
  },
  Dead: {
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
      <CheckRow label="Battery Status">
        <StatusToggle
          options={["Good", "Weak", "Dead"] as const}
          value={checks.batteryStatus}
          onChange={(v) => onChange("batteryStatus", v as ThreeOptionStatus)}
          colorMap={batteryColors}
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
