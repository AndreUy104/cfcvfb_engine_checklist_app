"use client";

import {
  Avatar,
  Box,
  Stack,
  Tooltip,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import type { UserWithPosition } from "@/utilities/types/users.types";
import { PositionChip } from "../PositionChip";

export interface UserColumn {
  key: string;
  label: string;
  labelSuffix?: React.ReactNode;
  align?: "left" | "center" | "right";
  sx?: object;
  renderCell: (row: UserWithPosition) => React.ReactNode;
}
function UserCell({ row }: { row: UserWithPosition }) {
  const displayName = row.name ?? "—";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: 12,
          fontWeight: 700,
          bgcolor: "primary.main",
        }}
      >
        {initials}
      </Avatar>
      <Box>
        <Typography
          fontWeight={700}
          fontSize="0.88rem"
          letterSpacing="0.02em"
          sx={{ color: "text.primary" }}
        >
          {displayName}
        </Typography>
        <Typography fontSize="0.75rem" sx={{ color: "text.disabled", mt: 0.1 }}>
          #{row.unit_number}
        </Typography>
      </Box>
    </Box>
  );
}

interface RowActionsProps {
  row: UserWithPosition;
  onView?: (row: UserWithPosition) => void;
  onEdit?: (row: UserWithPosition) => void;
}

function RowMenu({ row, onView, onEdit }: RowActionsProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);

  return (
    <>
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
        {onView && (
          <MenuItem
            onClick={() => {
              onView(row);
              close();
            }}
            dense
            sx={{
              color: "#374151",
              "&:hover": { background: "rgba(99,102,241,0.08)" },
              "&:hover .mi-view": { color: "#6366f1" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <VisibilityOutlinedIcon
                className="mi-view"
                fontSize="small"
                sx={{ color: "#9ca3af", transition: "color .15s" }}
              />
            </ListItemIcon>
            <ListItemText
              primary="View Details"
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
              primary="Edit User"
              slotProps={{ primary: { fontSize: "0.82rem", color: "#374151" } }}
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

function InlineActions({ row, onView, onEdit }: RowActionsProps) {
  return (
    <Stack direction="row" justifyContent="flex-end" gap={0.75}>
      {onView && (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => onView(row)}
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
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onEdit && (
        <Tooltip title="Edit User">
          <IconButton
            size="small"
            onClick={() => onEdit(row)}
            sx={{
              color: "text.disabled",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 1.5,
              "&:hover": {
                color: "#f59e0b",
                borderColor: "rgba(245,158,11,0.4)",
                background: "rgba(245,158,11,0.08)",
              },
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

function ActionsCell(props: RowActionsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return isMobile ? <RowMenu {...props} /> : <InlineActions {...props} />;
}

export interface UserColumnOptions {
  onView?: (row: UserWithPosition) => void;
  onEdit?: (row: UserWithPosition) => void;
}

export function getUserColumns(options?: UserColumnOptions): UserColumn[] {
  const { onView, onEdit } = options ?? {};

  return [
    {
      key: "name",
      label: "User",
      renderCell: (row) => <UserCell row={row} />,
    },
    {
      key: "email",
      label: "Email",
      sx: { display: { xs: "none", sm: "table-cell" } },
      renderCell: (row) => (
        <Typography fontSize="0.875rem" color="text.secondary">
          {row.email ?? "—"}
        </Typography>
      ),
    },
    {
      key: "position",
      label: "Position",
      renderCell: (row) => <PositionChip name={row.Positions?.name} />,
    },
    {
      key: "actions",
      label: "",
      align: "right",
      renderCell: (row) => (
        <ActionsCell row={row} onView={onView} onEdit={onEdit} />
      ),
    },
  ];
}
