"use client";

import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { PpeItemWithAvailable, PpeColumn } from "@/utilities/types/ppe.types";

function StatBadge({
  value,
  variant = "neutral",
}: {
  value: number;
  variant?: "neutral" | "available" | "issued";
}) {
  const colors = {
    neutral: { bg: "rgba(220,38,38,0.08)", fg: "#dc2626" },
    available: { bg: "rgba(34,197,94,0.10)", fg: "#16a34a" },
    issued: { bg: "rgba(234,179,8,0.12)", fg: "#a16207" },
  }[variant];

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
        background: colors.bg,
        color: colors.fg,
      }}
    >
      {value}
    </Box>
  );
}

interface GetPpeColumnsOptions {
  positionId?: number | null;
  onEdit?: (row: PpeItemWithAvailable) => void;
  onDelete?: (row: PpeItemWithAvailable) => void;
}

export function getPpeColumns({
  positionId,
  onEdit,
  onDelete,
}: GetPpeColumnsOptions = {}): PpeColumn[] {
  const base: PpeColumn[] = [
    {
      key: "category",
      label: "Category",
      renderCell: (row) => (
        <Typography fontSize="0.85rem" sx={{ color: "text.primary" }}>
          {row.category}
        </Typography>
      ),
    },
    {
      key: "brand",
      label: "Brand",
      renderCell: (row) => (
        <Typography
          fontWeight={700}
          fontSize="0.88rem"
          letterSpacing="0.02em"
          sx={{ color: "text.primary" }}
        >
          {row.brand}
        </Typography>
      ),
    },
    {
      key: "model",
      label: "Model",
      renderCell: (row) => (
        <Typography fontSize="0.85rem" sx={{ color: "text.primary" }}>
          {row.model}
        </Typography>
      ),
    },
    {
      key: "size",
      label: "Size",
      align: "center",
      renderCell: (row) => (
        <Typography fontSize="0.85rem" sx={{ color: "text.primary" }}>
          {row.size}
        </Typography>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "center",
      renderCell: (row) => <StatBadge value={row.total ?? 0} />,
    },
    {
      key: "available",
      label: "Available",
      align: "center",
      renderCell: (row) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={0.5}
        >
          <StatBadge value={row.available ?? 0} variant="available" />
          {row.is_low_stock && (
            <Tooltip title="Low stock — at or below 15% available" arrow>
              <WarningAmberIcon fontSize="small" sx={{ color: "#eab308" }} />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      key: "issued",
      label: "Issued",
      align: "center",
      renderCell: (row) => (
        <StatBadge value={row.issued ?? 0} variant="issued" />
      ),
    },
  ];

  if (positionId === 2 || positionId === 3) {
    base.push({
      key: "actions",
      label: "Actions",
      align: "center",
      renderCell: (row) => (
        <Box display="flex" justifyContent="center" gap={0.5}>
          <Tooltip title="Edit PPE item" arrow>
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

          <Tooltip
            title={
              (row.issued ?? 0) > 0
                ? "Cannot delete — items currently issued"
                : "Delete PPE item"
            }
            arrow
          >
            {/* span wrapper so the tooltip still works on a disabled button */}
            <span>
              <IconButton
                size="small"
                disabled={(row.issued ?? 0) > 0}
                onClick={() => onDelete?.(row)}
                sx={{
                  color: "rgba(220,38,38,0.55)",
                  "&:hover": {
                    color: "#dc2626",
                    background: "rgba(220,38,38,0.10)",
                  },
                  "&.Mui-disabled": {
                    color: "rgba(255,255,255,0.15)",
                  },
                  transition: "color 0.15s, background 0.15s",
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    });
  }

  return base;
}
