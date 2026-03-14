import { Box, Typography } from "@mui/material";
import { LevelStatus } from "@/utilities/types/engineCheck.types";
import StatusToggle from "./StatusToggle";
import { LEVEL_OPTIONS } from "@/utilities/constants/apparatus.constant";

const levelColorMap: Record<
  string,
  { bg: string; border: string; color: string }
> = {
  Full: {
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.5)",
    color: "#22c55e",
  },
  "3/4": {
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.5)",
    color: "#22c55e",
  },
  "1/2": {
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.5)",
    color: "#f59e0b",
  },
  "1/4": {
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.5)",
    color: "#ef4444",
  },
  Empty: {
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.5)",
    color: "#ef4444",
  },
};

interface LevelRowProps {
  label: string;
  value: LevelStatus | null;
  onChange: (val: LevelStatus) => void;
}

export default function LevelRow({ label, value, onChange }: LevelRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 0.75, sm: 0 },
        py: 1.5,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "rgba(255,255,255,0.65)",
          fontWeight: 600,
          fontSize: "0.82rem",
          minWidth: 160,
        }}
      >
        {label}
      </Typography>
      <StatusToggle
        options={LEVEL_OPTIONS}
        value={value}
        onChange={onChange}
        colorMap={levelColorMap}
      />
    </Box>
  );
}
