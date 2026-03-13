import { Box, Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface StatusToggleProps<T extends string> {
  options: readonly T[];
  value: T | null;
  onChange: (val: T) => void;
  colorMap: Record<string, { bg: string; border: string; color: string }>;
}

export default function StatusToggle<T extends string>({
  options,
  value,
  onChange,
  colorMap,
}: StatusToggleProps<T>) {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const isActive = value === opt;
        const colors = colorMap[opt] ?? {
          bg: `${theme.palette.secondary.main}20`,
          border: `${theme.palette.secondary.main}50`,
          color: theme.palette.secondary.main,
        };
        return (
          <Chip
            key={opt}
            label={opt}
            onClick={() => onChange(opt)}
            size="small"
            sx={{
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.72rem",
              letterSpacing: "0.04em",
              bgcolor: isActive ? colors.bg : "rgba(255,255,255,0.04)",
              border: `1px solid ${isActive ? colors.border : "rgba(255,255,255,0.1)"}`,
              color: isActive ? colors.color : "rgba(255,255,255,0.4)",
              transition: "all 0.15s",
              "&:hover": {
                bgcolor: isActive ? colors.bg : "rgba(255,255,255,0.08)",
              },
            }}
          />
        );
      })}
    </Box>
  );
}