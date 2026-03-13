"use client";

import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Equipment, EquipmentColumn } from  "@/utilities/types/equipment.types";


function StatBadge({
  value,
}: {
  value: number;

}) {
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

export function getEquipmentColumns(options?: {
  onEdit?: (row: Equipment) => void;
  onDelete?: (row: Equipment) => void;
}): EquipmentColumn[] {
  const { onEdit, onDelete } = options ?? {};

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
      key: "total",
      label: "Total",
      align: "center",
      renderCell: (row) => (
        <StatBadge
          value={row.total}
        />
      ),
    },

    {
      key: "inService",
      label: "In Service",
      align: "center",
      renderCell: (row) => (
        <StatBadge
          value={row.inService}
        />
      ),
    },

    {
      key: "down",
      label: "Down / Busted",
      align: "center",
      renderCell: (row) => (
        <StatBadge
          value={row.down}
        />
      ),
    },

    {
      key: "actions",
      label: "Actions",
      align: "right",
      renderCell: (row) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => onEdit?.(row)}
              sx={{
                color: "text.disabled",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 1.5,
                mr: 0.75,
                "&:hover": {
                  color: "#dc2626",
                  borderColor: "rgba(220,38,38,0.4)",
                  background: "rgba(220,38,38,0.08)",
                },
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton
              size="small"
              onClick={() => onDelete?.(row)}
              sx={{
                color: "text.disabled",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 1.5,
                "&:hover": {
                  color: "#ef4444",
                  borderColor: "rgba(239,68,68,0.4)",
                  background: "rgba(239,68,68,0.08)",
                },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];
}
