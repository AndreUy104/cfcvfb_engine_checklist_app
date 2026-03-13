import { Box, Typography } from "@mui/material";

interface CheckRowProps {
  label: string;
  children: React.ReactNode;
}

export default function CheckRow({ label, children }: CheckRowProps) {
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
        "&:last-child": { borderBottom: "none" },
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
      {children}
    </Box>
  );
}