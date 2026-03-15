"use client";

import { Box, Typography } from "@mui/material";
import { EquipmentColumn } from "@/utilities/types/equipment.types";

function StatBadge({ value }: { value: number }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 36,
        px: 1.25,
        py: 0.4,
        borderRadius: 1.5,
        fontWeight: 700,
        fontSize: "0.85rem",
        letterSpacing: "0.02em",
      }}
    >
      {value}
    </Box>
  );
}

export function getEquipmentColumns(): EquipmentColumn[] {
  return [
    {
      key: "name",
      label: "Equipment Name",
      renderCell: (row) => (
        <Typography
          fontWeight={700}
          fontSize="0.88rem"
          letterSpacing="0.02em"
          sx={{ color: "text.primary" }}
        >
          {row.name}
        </Typography>
      ),
    },

    {
      key: "total_quantity",
      label: "Total",
      align: "center",
      renderCell: (row) => <StatBadge value={row.total_quantity ?? 0} />,
    },

    {
      key: "total_in_service",
      label: "In Service",
      align: "center",
      renderCell: (row) => <StatBadge value={row.total_in_service ?? 0} />,
    },

    {
      key: "total_down",
      label: "Down / Busted",
      align: "center",
      renderCell: (row) => <StatBadge value={row.total_down ?? 0} />,
    },
  ];
}
