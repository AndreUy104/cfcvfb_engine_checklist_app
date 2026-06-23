"use client";

import { Box, Paper, Typography } from "@mui/material";
import { PpeItemWithAvailable } from "@/utilities/types/ppe.types";

interface PpeStatCardsProps {
  ppeItems: PpeItemWithAvailable[];
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 120,
        p: 2,
        border: "1px solid rgba(220,38,38,0.20)",
        borderRadius: 2,
        background: "rgba(0,0,0,0.25)",
      }}
    >
      <Typography
        sx={{
          color: "#dc2626",
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "1.6rem",
          fontWeight: 700,
          color: accent ?? "text.primary",
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

// Aggregates across ALL items, not the filtered/paginated subset — these
// cards summarize the whole PPE inventory regardless of what the search/
// category filter is currently showing in the table below.
export default function PpeStatCards({ ppeItems }: PpeStatCardsProps) {
  const totals = ppeItems.reduce(
    (acc, item) => ({
      total: acc.total + (item.total ?? 0),
      available: acc.available + (item.available ?? 0),
      issued: acc.issued + (item.issued ?? 0),
    }),
    { total: 0, available: 0, issued: 0 },
  );

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexWrap: "wrap",
        mb: 2,
      }}
    >
      <StatCard label="Total" value={totals.total} />
      <StatCard label="Available" value={totals.available} accent="#22c55e" />
      <StatCard label="Issued" value={totals.issued} accent="#eab308" />
    </Box>
  );
}
