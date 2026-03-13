"use client";

import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Equipment, EquipmentColumn, EquipmentStatus } from "@/utilities/types/equipment.types";


const STATUS_CONFIG: Record<
  EquipmentStatus,
  { dotColor: string; bgColor: string; textColor: string; borderColor: string }
> = {
  "In Service": {
    dotColor: "#22c55e",
    bgColor: "rgba(34,197,94,0.10)",
    textColor: "#22c55e",
    borderColor: "rgba(34,197,94,0.30)",
  },
  Repair: {
    dotColor: "#f59e0b",
    bgColor: "rgba(245,158,11,0.10)",
    textColor: "#f59e0b",
    borderColor: "rgba(245,158,11,0.30)",
  },
  "Out of Service": {
    dotColor: "#ef4444",
    bgColor: "rgba(239,68,68,0.10)",
    textColor: "#ef4444",
    borderColor: "rgba(239,68,68,0.30)",
  },
};

function StatusChip({ status }: { status: EquipmentStatus }) {
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


const APPARATUS_ICON: Record<string, string> = {
  Engine: "🔥",
  Ladder: "🏗",
  Rescue: "⚙️",
};

function getApparatusIcon(apparatus: string): string {
  for (const key of Object.keys(APPARATUS_ICON)) {
    if (apparatus.startsWith(key)) return APPARATUS_ICON[key];
  }
  return "🚒";
}


export function getEquipmentColumns(options?: {
  onEdit?: (row: Equipment) => void;
  onDelete?: (row: Equipment) => void;
}): EquipmentColumn[] {
  const { onEdit, onDelete } = options ?? {};

  return [
    {
      key: "name",
      label: "Item Name",
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
        </>
      ),
    },

    // ── Status ────────────────────────────────────────────────────────────────
    {
      key: "status",
      label: "Status",
      renderCell: (row) => <StatusChip status={row.status} />,
    },

    // ── Assigned Apparatus ────────────────────────────────────────────────────
    {
      key: "apparatus",
      label: "Assigned Apparatus",
      labelSuffix: (
        <Box component="span" sx={{ opacity: 0.5, fontSize: "0.6rem", ml: 0.5 }}>
          ↕
        </Box>
      ),
      renderCell: (row) => (
        <Box
          display="flex"
          alignItems="center"
          gap={0.75}
          sx={{ color: "text.secondary", fontSize: "0.875rem" }}
        >
          <span style={{ fontSize: "1rem" }}>{getApparatusIcon(row.apparatus)}</span>
          {row.apparatus}
        </Box>
      ),
    },

    // ── Last Inspected ────────────────────────────────────────────────────────
    {
      key: "lastInspected",
      label: "Last Inspected",
      renderCell: (row) => {
        const isOverdue = row.lastInspected.includes("Overdue");
        return (
          <Typography
            fontSize="0.875rem"
            fontWeight={isOverdue ? 600 : 400}
            color={isOverdue ? "#f59e0b" : "text.secondary"}
          >
            {row.lastInspected}
          </Typography>
        );
      },
    },

    // ── Actions ───────────────────────────────────────────────────────────────
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