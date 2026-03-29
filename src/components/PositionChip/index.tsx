import { Typography, Chip } from "@mui/material";

export const PositionChip = ({ name }: { name: string | null | undefined }) => {
  if (!name) {
    return (
      <Typography variant="caption" color="text.disabled">
        No position
      </Typography>
    );
  }
  return (
    <Chip
      label={name}
      size="small"
      variant="outlined"
      color="primary"
      sx={{ fontWeight: 600, fontSize: "0.72rem", height: 26 }}
    />
  );
};
