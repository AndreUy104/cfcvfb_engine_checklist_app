"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TablePagination,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useRouter } from "next/navigation";
import { getUserColumns } from "./columns";
import { useAllUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { PERMISSION } from "@/utilities/constants/auth.constant";
import type { UserWithPosition } from "@/utilities/types/users.types";
import { InviteUserModal } from "../InviteUserModal";

export default function UserTable() {
  const router = useRouter();
  const { users, loading, error, refresh } = useAllUsers();
  const { positionId } = useAuth();

  const canEdit =
    positionId !== null &&
    (PERMISSION.OIC_AND_OFFICER as readonly number[]).includes(positionId);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inviteOpen, setInviteOpen] = useState(false);

  function handleView(user: UserWithPosition) {
    router.push(`/Personnel/${user.id}`);
  }

  function handleEdit(user: UserWithPosition) {
    router.push(`/Personnel/${user.id}?edit=true`);
  }

  const columns = getUserColumns({
    onView: handleView,
    onEdit: canEdit ? handleEdit : undefined,
  });

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.Positions?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const pendingCount = users.filter((u) => !u.position_id).length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={1}
        mb={2}
      >
        <Box display="flex" gap={1} flexWrap="wrap">
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.20)",
            }}
          >
            <Typography fontSize="0.75rem" color="#6366f1">
              Total{" "}
              <Box component="span" fontWeight={700}>
                {users.length}
              </Box>
            </Typography>
          </Box>
          {pendingCount > 0 && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.20)",
              }}
            >
              <Typography fontSize="0.75rem" color="#f59e0b">
                No Position{" "}
                <Box component="span" fontWeight={700}>
                  {pendingCount}
                </Box>
              </Typography>
            </Box>
          )}
        </Box>

        {canEdit && (
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => setInviteOpen(true)}
            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
          >
            Invite User
          </Button>
        )}
      </Box>

      {/* Search */}
      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Search by name, email, or position…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: 340 } }}
        />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="secondary" size={32} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 2,
            background: "transparent",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align ?? "left"}
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: "text.disabled",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      py: 1.25,
                      ...("sx" in col && col.sx ? col.sx : {}),
                    }}
                  >
                    {col.label}
                    {col.labelSuffix ?? null}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 4, color: "text.disabled" }}
                  >
                    {search ? "No users match your search." : "No users found."}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      cursor: "pointer",
                      "&:last-child td": { border: 0 },
                      "& td": {
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      },
                    }}
                    onClick={() => handleView(user)}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align ?? "left"}
                        sx={{
                          py: 1.25,
                          ...("sx" in col && col.sx ? col.sx : {}),
                        }}
                        onClick={
                          col.key === "actions"
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {col.renderCell(user)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              color: "text.secondary",
              fontSize: "0.8rem",
            }}
          />
        </TableContainer>
      )}

      {canEdit && (
        <InviteUserModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          onSuccess={() => {
            setInviteOpen(false);
            refresh();
          }}
        />
      )}
    </Box>
  );
}
