"use client";

import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  History,
  AdminPanelSettings,
  EditNote,
  EditOutlined,
} from "@mui/icons-material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  useUserById,
  useUserInspections,
  useAllPositions,
} from "@/hooks/useUsers";
import { useState } from "react";
import InspectionDetailModal from "@/components/Report/InspectionHistoryTab/InspectionDetailModal";
import type { InspectionWithDetails } from "@/utilities/types/inspection.types";

export default function UserDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params?.id ? Number(params.id) : undefined;
  const router = useRouter();

  // ?edit=true → edit mode, otherwise read-only
  const isEditMode = searchParams.get("edit") === "true";

  const {
    user,
    loading,
    saving,
    saveError,
    updateName,
    updateUnitNumber,
    updatePosition,
  } = useUserById(userId);
  const { inspections, loading: inspLoading } = useUserInspections(userId);
  const { positions, loading: positionsLoading } = useAllPositions();

  // Local override state — null = no pending edit, falls back to server value
  const [editedName, setEditedName] = useState<string | null>(null);
  const [editedUnitNumber, setEditedUnitNumber] = useState<number | null>(null);
  const [editedPositionId, setEditedPositionId] = useState<number | null>(null);
  const [unitNumberError, setUnitNumberError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const displayedName = editedName ?? user?.name ?? "";
  const displayedUnitNumber = editedUnitNumber ?? user?.unit_number ?? "";
  const displayedPositionId = editedPositionId ?? user?.position_id ?? "";

  const hasPendingChanges =
    editedName !== null ||
    editedUnitNumber !== null ||
    editedPositionId !== null;

  // Inspection modal
  const [selectedInspection, setSelectedInspection] =
    useState<InspectionWithDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function handleOpenInspection(inspection: InspectionWithDetails) {
    setSelectedInspection(inspection);
    setModalOpen(true);
  }
  function handleCloseInspection() {
    setModalOpen(false);
    setSelectedInspection(null);
  }

  const handleSave = async () => {
    setSaveSuccess(false);
    const ops: Promise<boolean>[] = [];
    if (editedName !== null) ops.push(updateName(editedName));
    if (editedUnitNumber !== null) ops.push(updateUnitNumber(editedUnitNumber));
    if (editedPositionId !== null) ops.push(updatePosition(editedPositionId));
    if (ops.length === 0) return;

    const results = await Promise.all(ops);
    if (results.every(Boolean)) {
      setEditedName(null);
      setEditedUnitNumber(null);
      setEditedPositionId(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.replace(`/Personnel/${userId}`);
    }
  };

  const handleDiscard = () => {
    setEditedName(null);
    setEditedUnitNumber(null);
    setEditedPositionId(null);
    setUnitNumberError(null);
    router.replace(`/Personnel/${userId}`);
  };

  const avatarInitials =
    (user?.name ?? "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <Box sx={{ maxWidth: 960, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Breadcrumbs>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => router.push("/Personnel")}
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <ArrowBack fontSize="small" /> Personnel
          </Link>
          <Typography color="text.primary">
            {loading ? "Loading…" : (user?.name ?? "User Details")}
          </Typography>
        </Breadcrumbs>

        {/* Mode indicator + toggle */}
        {!loading &&
          (isEditMode ? (
            <Chip
              icon={<EditOutlined sx={{ fontSize: "0.85rem !important" }} />}
              label="Editing"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
          ) : (
            <Tooltip title="Switch to edit mode">
              <Button
                size="small"
                startIcon={<EditOutlined />}
                onClick={() => router.push(`/Personnel/${userId}?edit=true`)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                Edit
              </Button>
            </Tooltip>
          ))}
      </Box>

      {/* ── Section 1: User Details ──────────────────────────────────────── */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <EditNote color="primary" />
          <Typography variant="h6" fontWeight={700}>
            User Details
          </Typography>
        </Box>

        {loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1 }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
            {/* Avatar */}
            <Grid size="auto">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: 28,
                  bgcolor: "primary.main",
                  mx: { xs: "auto", sm: 0 },
                }}
              >
                {avatarInitials}
              </Avatar>
            </Grid>

            {/* Fields */}
            <Grid size="grow">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    size="small"
                    value={displayedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    // Read-only in view mode
                    disabled={!isEditMode}
                    slotProps={{
                      input: {
                        readOnly: !isEditMode,
                        disableUnderline: !isEditMode,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email"
                    fullWidth
                    size="small"
                    value={user?.email ?? "—"}
                    disabled
                    helperText={
                      isEditMode ? "Managed by Supabase Auth" : undefined
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Unit Number"
                    fullWidth
                    size="small"
                    type={isEditMode ? "number" : "text"}
                    value={displayedUnitNumber}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setEditedUnitNumber(null);
                        setUnitNumberError(null);
                        return;
                      }
                      const parsed = parseInt(raw, 10);
                      if (isNaN(parsed) || parsed < 1) {
                        setUnitNumberError("Must be a positive number");
                      } else {
                        setUnitNumberError(null);
                        setEditedUnitNumber(parsed);
                      }
                    }}
                    disabled={!isEditMode}
                    error={!!unitNumberError}
                    helperText={unitNumberError ?? undefined}
                    slotProps={{
                      htmlInput: { min: 1 },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Member Since"
                    fullWidth
                    size="small"
                    value={
                      user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "—"
                    }
                    disabled
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* ── Section 2: Position Assignment ──────────────────────────────── */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AdminPanelSettings color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Position Assignment
          </Typography>
        </Box>

        {!isEditMode ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Current position:
            </Typography>
            {user?.Positions?.name ? (
              <Chip
                label={user.Positions.name}
                color="primary"
                variant="outlined"
                size="small"
              />
            ) : (
              <Typography
                variant="body2"
                color="text.disabled"
                fontStyle="italic"
              >
                No position assigned
              </Typography>
            )}
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Assign a position from your Positions table. This controls the
              users access level and role within the system.
            </Typography>

            {user?.Positions?.name && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Current position
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={user.Positions.name}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            )}

            <FormControl
              size="small"
              sx={{ minWidth: 280 }}
              disabled={positionsLoading || saving}
            >
              <InputLabel>Assign Position</InputLabel>
              <Select
                value={displayedPositionId}
                label="Assign Position"
                onChange={(e) => setEditedPositionId(e.target.value as number)}
              >
                {positionsLoading ? (
                  <MenuItem disabled>Loading…</MenuItem>
                ) : (
                  positions.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </>
        )}

        {isEditMode && (
          <>
            <Divider sx={{ my: 3 }} />

            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {saveError}
              </Alert>
            )}
            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Changes saved successfully!
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={
                  saving || loading || !hasPendingChanges || !!unitNumberError
                }
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleDiscard}
              >
                Discard
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* ── Section 3: Inspection History ───────────────────────────────── */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <History color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Inspection History
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "text.disabled",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    py: 1.25,
                  },
                }}
              >
                <TableCell>Engine</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>

            <TableBody>
              {inspLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {[1, 2, 3, 4].map((j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : inspections.map((rec) => (
                    <TableRow
                      key={rec.id}
                      hover
                      sx={{
                        "&:last-child td": { border: 0 },
                        "& td": {
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          py: 1.25,
                        },
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={700} fontSize="0.88rem">
                          {rec.Engines?.name ?? "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontSize="0.875rem" color="text.secondary">
                          {new Date(rec.inspected_at).toLocaleDateString(
                            "en-PH",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </Typography>
                        <Typography fontSize="0.75rem" color="text.disabled">
                          {new Date(rec.inspected_at).toLocaleTimeString(
                            "en-PH",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography
                          fontSize="0.875rem"
                          color={
                            rec.remarks ? "text.secondary" : "text.disabled"
                          }
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontStyle: rec.remarks ? "normal" : "italic",
                          }}
                        >
                          {rec.remarks ?? "No remarks"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="View full inspection">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenInspection(rec)}
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
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

              {!inspLoading && inspections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">
                      No inspection records found for this user.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <InspectionDetailModal
        isOpen={modalOpen}
        onClose={handleCloseInspection}
        inspection={selectedInspection}
        type="engine"
      />
    </Box>
  );
}
