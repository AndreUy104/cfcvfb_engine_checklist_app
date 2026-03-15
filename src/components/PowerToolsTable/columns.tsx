"use client"

import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import { Equipment, PowerToolColumn } from "@/utilities/types/equipment.types"

function StatusChip({ down, total }: { down: number | null; total: number | null }) {
  const isDown = (down ?? 0) > 0
  const allDown = (down ?? 0) === (total ?? 0)

  const cfg = allDown
    ? { dotColor: "#ef4444", bgColor: "rgba(239,68,68,0.10)", textColor: "#ef4444", borderColor: "rgba(239,68,68,0.30)", label: "Down" }
    : isDown
      ? { dotColor: "#f59e0b", bgColor: "rgba(245,158,11,0.10)", textColor: "#f59e0b", borderColor: "rgba(245,158,11,0.30)", label: "Partial" }
      : { dotColor: "#22c55e", bgColor: "rgba(34,197,94,0.10)", textColor: "#22c55e", borderColor: "rgba(34,197,94,0.30)", label: "OK" }

  return (
    <Chip
      size="small"
      icon={
        <Box
          component="span"
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: cfg.dotColor,
            boxShadow: `0 0 5px ${cfg.dotColor}`,
            ml: "10px !important",
          }}
        />
      }
      label={cfg.label}
      sx={{
        background: cfg.bgColor,
        border: `1px solid ${cfg.borderColor}`,
        color: cfg.textColor,
        fontWeight: 600,
        fontSize: "0.72rem",
        letterSpacing: "0.03em",
        height: 26,
        "& .MuiChip-label": { pl: 0.5, pr: 1.5 },
      }}
    />
  )
}

export function getPowerToolColumns(options?: {
  onCheck?: (row: Equipment) => void
}): PowerToolColumn[] {
  const { onCheck } = options ?? {}

  return [
    {
      key: "name",
      label: "Tool",
      renderCell: (row) => (
        <>
          <Typography fontWeight={700} fontSize="0.88rem" letterSpacing="0.02em" sx={{ color: "text.primary" }}>
            {row.name ?? "—"}
          </Typography>
          <Typography fontSize="0.75rem" sx={{ color: "text.disabled", mt: 0.25 }}>
            #{row.id}
          </Typography>
        </>
      ),
    },
    {
      key: "total_in_service",
      label: "In Service",
      renderCell: (row) => (
        <Typography fontSize="0.875rem" color="text.secondary">
          {row.total_in_service ?? 0} / {row.total_quantity ?? 0}
        </Typography>
      ),
    },
    {
      key: "total_down",
      label: "Status",
      renderCell: (row) => (
        <StatusChip down={row.total_down} total={row.total_quantity} />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      renderCell: (row) => (
        <Tooltip title="Check Tool">
          <IconButton
            size="small"
            onClick={() => onCheck?.(row)}
            sx={{
              color: "text.disabled",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 1.5,
              "&:hover": {
                color: "#22c55e",
                borderColor: "rgba(34,197,94,0.4)",
                background: "rgba(34,197,94,0.08)",
              },
            }}
          >
            <CheckCircleOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ]
}