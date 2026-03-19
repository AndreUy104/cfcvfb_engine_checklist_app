"use client";

import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Equipment, EquipmentColumn } from "@/utilities/types/equipment.types";

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

interface GetEquipmentColumnsOptions {
  positionId?: number | null;
  onEdit?: (row: Equipment) => void;
  onDelete?: (row: Equipment) => void;
}

export function getEquipmentColumns({
  positionId,
  onEdit,
  onDelete,
}: GetEquipmentColumnsOptions = {}): EquipmentColumn[] {
  const base: EquipmentColumn[] = [
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

  if (positionId === 3) {
    base.push({
      key: "actions",
      label: "Actions",
      align: "center",
      renderCell: (row) => (
        <Box display="flex" justifyContent="center" gap={0.5}>
          <Tooltip title="Edit equipment" arrow>
            <IconButton
              size="small"
              onClick={() => onEdit?.(row)}
              sx={{
                color: "rgba(220,38,38,0.55)",
                "&:hover": {
                  color: "#dc2626",
                  background: "rgba(220,38,38,0.10)",
                },
                transition: "color 0.15s, background 0.15s",
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete equipment" arrow>
            <IconButton
              size="small"
              onClick={() => onDelete?.(row)}
              sx={{
                color: "rgba(220,38,38,0.55)",
                "&:hover": {
                  color: "#dc2626",
                  background: "rgba(220,38,38,0.10)",
                },
                transition: "color 0.15s, background 0.15s",
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    });
  }

  return base;
}
