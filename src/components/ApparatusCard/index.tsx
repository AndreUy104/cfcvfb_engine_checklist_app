import { Card, CardContent, Typography, Button, Box } from "@mui/material";

type Props = {
  title: string;
  status: "ready" | "progress" | "alert";
};

export default function ApparatusCard({ title, status }: Props) {
  const color =
    status === "ready"
      ? "success"
      : status === "progress"
      ? "warning"
      : "error";

  return (
    <Card
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>

        <Box mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </Box>

        <Typography variant="body2" color="gray" sx={{p:3}}>
          Last Checked: 2h ago
        </Typography>
        <Button
          variant="contained"
          color={color}
          fullWidth
        >
          START CHECK
        </Button>

      </CardContent>
    </Card>
  );
}