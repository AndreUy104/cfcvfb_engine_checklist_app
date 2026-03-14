"use client";

import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  PowerTool,
  PowerToolStatus,
  PowerToolColumn,
} from "@/utilities/types/equipment.types";

const STATUS_CONFIG: Record<
  PowerToolStatus,
  { dotColor: string; bgColor: string; textColor: string; borderColor: string }
> = {
  OK: {
    dotColor: "#22c55e",
    bgColor: "rgba(34,197,94,0.10)",
    textColor: "#22c55e",
    borderColor: "rgba(34,197,94,0.30)",
  },
  "In Repair": {
    dotColor: "#f59e0b",
    bgColor: "rgba(245,158,11,0.10)",
    textColor: "#f59e0b",
    borderColor: "rgba(245,158,11,0.30)",
  },
  Down: {
    dotColor: "#ef4444",
    bgColor: "rgba(239,68,68,0.10)",
    textColor: "#ef4444",
    borderColor: "rgba(239,68,68,0.30)",
  },
};

function StatusChip({ status }: { status: PowerToolStatus }) {
  const cfg = STATUS_CONFIG[status];
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
      label={status}
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
  );
}

export function getPowerToolColumns(options?: {
  onCheck?: (row: PowerTool) => void;
}): PowerToolColumn[] {
  const { onCheck } = options ?? {};

  return [
    {
      key: "name",
      label: "Tool",
      renderCell: (row) => (
        <>
          <Typography
            fontWeight={700}
            fontSize="0.88rem"
            letterSpacing="0.02em"
            sx={{ color: "text.primary" }}
          >
            {row.name}
          </Typography>
          <Typography
            fontSize="0.75rem"
            sx={{ color: "text.disabled", mt: 0.25 }}
          >
            {row.id}
          </Typography>
        </>
      ),
    },

    {
      key: "lastChecked",
      label: "Last Checked",
      renderCell: (row) => {
        const isOverdue = row.status === "Down";
        return (
          <Typography
            fontSize="0.875rem"
            fontWeight={isOverdue ? 600 : 400}
            color={isOverdue ? "#f59e0b" : "text.secondary"}
          >
            {row.lastChecked}
          </Typography>
        );
      },
    },

    {
      key: "status",
      label: "Status",
      renderCell: (row) => <StatusChip status={row.status} />,
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
  ];
}
