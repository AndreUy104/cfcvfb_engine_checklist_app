"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Equipment, PowerToolColumn } from "@/utilities/types/equipment.types";

function StatusChip({
  down,
  total,
}: {
  down: number | null;
  total: number | null;
}) {
  const isDown = (down ?? 0) > 0;
  const allDown = (down ?? 0) === (total ?? 0) && (total ?? 0) > 0;

  const cfg = allDown
    ? {
        dotColor: "#ef4444",
        bgColor: "rgba(239,68,68,0.10)",
        textColor: "#ef4444",
        borderColor: "rgba(239,68,68,0.30)",
        label: "Down",
      }
    : isDown
      ? {
          dotColor: "#f59e0b",
          bgColor: "rgba(245,158,11,0.10)",
          textColor: "#f59e0b",
          borderColor: "rgba(245,158,11,0.30)",
          label: "Partial",
        }
      : {
          dotColor: "#22c55e",
          bgColor: "rgba(34,197,94,0.10)",
          textColor: "#22c55e",
          borderColor: "rgba(34,197,94,0.30)",
          label: "OK",
        };

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
  );
}
interface RowMenuProps {
  row: Equipment;
  onCheck?: (row: Equipment) => void;
  onEdit?: (row: Equipment) => void;
  onDelete?: (row: Equipment) => void;
}

function RowMenu({ row, onCheck, onEdit, onDelete }: RowMenuProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);
  const showOnlyCheck = onCheck && !onEdit && !onDelete;

  return (
    <>
      {showOnlyCheck ? (
        <IconButton
          size="small"
          onClick={() => onCheck(row)}
          sx={{
            color: "text.disabled",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 1.5,
            "&:hover": {
              color: "success.main",
              borderColor: "rgba(34,197,94,0.4)",
              background: "rgba(34,197,94,0.08)",
            },
          }}
        >
          <CheckCircleOutlineIcon fontSize="small" />
        </IconButton>
      ) : (
        <IconButton
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            color: "text.disabled",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 1.5,
            "&:hover": {
              color: "text.secondary",
              borderColor: "rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.04)",
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )}

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 2,
              minWidth: 160,
              mt: 0.5,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            },
          },
        }}
      >
        {onCheck && (
          <MenuItem
            onClick={() => {
              onCheck(row);
              close();
            }}
            dense
            sx={{
              color: "#374151",
              "&:hover": { background: "rgba(34,197,94,0.08)" },
              "&:hover .mi-check": { color: "#22c55e" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircleOutlineIcon
                className="mi-check"
                fontSize="small"
                sx={{ color: "#9ca3af", transition: "color .15s" }}
              />
            </ListItemIcon>
            <ListItemText
              primary="Run Checklist"
              slotProps={{ primary: { fontSize: "0.82rem", color: "#374151" } }}
            />
          </MenuItem>
        )}

        {onEdit && (
          <MenuItem
            onClick={() => {
              onEdit(row);
              close();
            }}
            dense
            sx={{
              color: "#374151",
              "&:hover": { background: "rgba(99,102,241,0.08)" },
              "&:hover .mi-edit": { color: "#6366f1" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <EditOutlinedIcon
                className="mi-edit"
                fontSize="small"
                sx={{ color: "#9ca3af", transition: "color .15s" }}
              />
            </ListItemIcon>
            <ListItemText
              primary="Edit Tool"
              slotProps={{ primary: { fontSize: "0.82rem", color: "#374151" } }}
            />
          </MenuItem>
        )}

        {onDelete && (onCheck || onEdit) && (
          <Divider sx={{ borderColor: "rgba(0,0,0,0.08)", my: 0.5 }} />
        )}

        {onDelete && (
          <MenuItem
            onClick={() => {
              onDelete(row);
              close();
            }}
            dense
            sx={{
              color: "#ef4444",
              "&:hover": { background: "rgba(239,68,68,0.08)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <DeleteOutlineIcon fontSize="small" sx={{ color: "#ef4444" }} />
            </ListItemIcon>
            <ListItemText
              primary="Remove Tool"
              slotProps={{ primary: { fontSize: "0.82rem", color: "#ef4444" } }}
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
interface InlineActionsProps {
  row: Equipment;
  onCheck?: (row: Equipment) => void;
  onEdit?: (row: Equipment) => void;
  onDelete?: (row: Equipment) => void;
}

function InlineActions({ row, onCheck, onEdit, onDelete }: InlineActionsProps) {
  return (
    <Stack direction="row" justifyContent="flex-end" gap={0.75}>
      {onCheck && (
        <Tooltip title="Run Checklist">
          <IconButton
            size="small"
            onClick={() => onCheck(row)}
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
      )}
      {onEdit && (
        <Tooltip title="Edit Tool">
          <IconButton
            size="small"
            onClick={() => onEdit(row)}
            sx={{
              color: "text.disabled",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 1.5,
              "&:hover": {
                color: "#6366f1",
                borderColor: "rgba(99,102,241,0.4)",
                background: "rgba(99,102,241,0.08)",
              },
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Remove Tool">
          <IconButton
            size="small"
            onClick={() => onDelete(row)}
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
      )}
    </Stack>
  );
}

function ActionsCell(props: InlineActionsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return isMobile ? <RowMenu {...props} /> : <InlineActions {...props} />;
}

export interface PowerToolColumnOptions {
  onCheck?: (row: Equipment) => void;
  onEdit?: (row: Equipment) => void;
  onDelete?: (row: Equipment) => void;
}

export function getPowerToolColumns(
  options?: PowerToolColumnOptions,
): PowerToolColumn[] {
  const { onCheck, onEdit, onDelete } = options ?? {};

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
            {row.name ?? "—"}
          </Typography>
          <Typography
            fontSize="0.75rem"
            sx={{ color: "text.disabled", mt: 0.25 }}
          >
            #{row.id}
          </Typography>
        </>
      ),
    },
    {
      key: "total_in_service",
      label: "In Service",
      sx: { display: { xs: "none", sm: "table-cell" } },
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
      label: "",
      align: "right",
      renderCell: (row) => (
        <ActionsCell
          row={row}
          onCheck={onCheck}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
