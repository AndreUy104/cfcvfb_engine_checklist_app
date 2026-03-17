import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Typography,
  IconButton,
  Box,
  Divider,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Collapse,
  Tooltip,
  useMediaQuery,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import { useTheme } from "@mui/material/styles";
import { EngineWithType } from "@/utilities/types/engine.types";
import { Equipment } from "@/utilities/types/equipment.types";
import { useEngineEquipment } from "@/hooks/useEngineEquipment";
import { useAuth } from "@/hooks/useAuth";
import EquipmentSearchFilter from "@/components/EquipmentSearchFilter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One compartment slot: quantity placed there + location label. */
interface CompartmentEntry {
  quantity: number;
  location: string;
}

/**
 * Per-equipment selection.
 * `compartments` always has ≥ 1 entry while the row is checked.
 */
interface SelectedEquipment {
  equipment_id: number;
  compartments: CompartmentEntry[];
}

interface AssignEquipmentToApparatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  engines?: EngineWithType[];
  equipments?: Equipment[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeEntry = (): CompartmentEntry => ({ quantity: 1, location: "" });

const defaultSelected = (eq: Equipment): SelectedEquipment => ({
  equipment_id: eq.id,
  compartments: [makeEntry()],
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AssignEquipmentToApparatusModal({
  isOpen,
  onClose,
  engines = [],
  equipments = [],
}: AssignEquipmentToApparatusModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { assignEquipment, loading, error } = useEngineEquipment();
  const { user } = useAuth();

  const [selectedEngineId, setSelectedEngineId] = useState<number | "">("");
  const [selected, setSelected] = useState<Record<number, SelectedEquipment>>(
    {},
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Always derived from the prop — never stale even with async data
  const filteredEquipments = searchQuery.trim()
    ? equipments.filter((eq) => {
        const lower = searchQuery.toLowerCase();
        return (
          eq.name?.toLowerCase().includes(lower) ||
          String(eq.id).includes(lower)
        );
      })
    : equipments;

  const selectedCount = Object.keys(selected).length;

  // Total DB rows that will be inserted on submit
  const totalRows = Object.values(selected).reduce(
    (sum, s) => sum + s.compartments.length,
    0,
  );

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleToggle(eq: Equipment) {
    setSelected((prev) => {
      if (prev[eq.id]) {
        const next = { ...prev };
        delete next[eq.id];
        return next;
      }
      return { ...prev, [eq.id]: defaultSelected(eq) };
    });
  }

  function handleCompartmentField(
    equipId: number,
    idx: number,
    field: keyof CompartmentEntry,
    value: string,
  ) {
    setSelected((prev) => {
      if (!prev[equipId]) return prev;
      const compartments = prev[equipId].compartments.map((c, i) =>
        i !== idx
          ? c
          : {
              ...c,
              [field]:
                field === "quantity"
                  ? Math.max(1, parseInt(value) || 1)
                  : value,
            },
      );
      return { ...prev, [equipId]: { ...prev[equipId], compartments } };
    });
  }

  function handleAddCompartment(equipId: number) {
    setSelected((prev) => {
      if (!prev[equipId]) return prev;
      return {
        ...prev,
        [equipId]: {
          ...prev[equipId],
          compartments: [...prev[equipId].compartments, makeEntry()],
        },
      };
    });
  }

  /** Removing the last compartment also deselects the equipment. */
  function handleRemoveCompartment(equipId: number, idx: number) {
    setSelected((prev) => {
      if (!prev[equipId]) return prev;
      const compartments = prev[equipId].compartments.filter(
        (_, i) => i !== idx,
      );
      if (compartments.length === 0) {
        const next = { ...prev };
        delete next[equipId];
        return next;
      }
      return { ...prev, [equipId]: { ...prev[equipId], compartments } };
    });
  }

  async function handleSubmit() {
    if (!selectedEngineId) return;
    // Each (equipment × compartment) pair → one DB row
    await Promise.all(
      Object.values(selected).flatMap((s) =>
        s.compartments.map((c) =>
          assignEquipment({
            engine_id: selectedEngineId,
            equipment_id: s.equipment_id,
            quantity_assigned: c.quantity,
            location_on_truck: c.location || null,
            assigned_by: user?.id ? Number(user.id) : null,
          }),
        ),
      ),
    );
    if (!error) handleClose();
  }

  function handleClose() {
    setSelectedEngineId("");
    setSelected({});
    setSearchQuery("");
    onClose();
  }

  // -------------------------------------------------------------------------
  // Style tokens
  // -------------------------------------------------------------------------

  const fieldSx = {
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.5)",
      fontWeight: 600,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.secondary.main,
    },
    "& .MuiOutlinedInput-root": {
      color: "#e8e8e8",
      bgcolor: "rgba(255,255,255,0.04)",
      borderRadius: 1.5,
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
      "&.Mui-focused fieldset": { borderColor: theme.palette.secondary.main },
    },
    "& .MuiSelect-icon": { color: theme.palette.secondary.main },
  };

  const inlineFieldSx = {
    "& .MuiOutlinedInput-root": {
      color: "#e8e8e8",
      bgcolor: "rgba(255,255,255,0.04)",
      fontSize: "0.78rem",
      "& fieldset": { borderColor: `${theme.palette.secondary.main}30` },
      "&:hover fieldset": { borderColor: `${theme.palette.secondary.main}60` },
      "&.Mui-focused fieldset": { borderColor: theme.palette.secondary.main },
    },
    "& input": { py: 0.6, px: 1 },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.35)",
      fontSize: "0.78rem",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.secondary.main,
    },
  };

  const cellSx = {
    color: "rgba(255,255,255,0.75)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    py: 1,
    px: { xs: 1, sm: 2 },
    fontSize: { xs: "0.75rem", sm: "0.875rem" },
  };

  const headerCellSx = {
    ...cellSx,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 700,
    fontSize: "0.7rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    borderBottom: `1px solid ${theme.palette.secondary.main}25`,
    bgcolor: "rgba(0,0,0,0.4) !important",
  };

  const checkboxSx = {
    color: "rgba(255,255,255,0.25)",
    "&.Mui-checked": { color: theme.palette.secondary.main },
  };

  function CompartmentRows({
    equipId,
    maxQty,
  }: {
    equipId: number;
    maxQty: number;
  }) {
    const entries = selected[equipId]?.compartments ?? [];
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {entries.map((entry, idx) => (
          <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Index pill */}
            <Typography
              variant="caption"
              sx={{
                color: `${theme.palette.secondary.main}70`,
                fontWeight: 700,
                fontSize: "0.65rem",
                minWidth: 14,
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              {idx + 1}
            </Typography>

            {/* Qty */}
            <TextField
              type="number"
              label="Qty"
              value={entry.quantity}
              onChange={(e) =>
                handleCompartmentField(equipId, idx, "quantity", e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
              inputProps={{ min: 1, max: maxQty }}
              size="small"
              sx={{ ...inlineFieldSx, width: 68, flexShrink: 0 }}
            />

            {/* Location */}
            <TextField
              label="Compartment"
              placeholder="e.g. Left Side, Rear"
              value={entry.location}
              onChange={(e) =>
                handleCompartmentField(equipId, idx, "location", e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
              size="small"
              sx={{ ...inlineFieldSx, flexGrow: 1 }}
            />

            {/* Remove */}
            <Tooltip
              title={
                entries.length === 1
                  ? "Deselect equipment"
                  : "Remove compartment"
              }
              placement="top"
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCompartment(equipId, idx);
                }}
                sx={{
                  color: "rgba(255,255,255,0.18)",
                  p: 0.4,
                  flexShrink: 0,
                  "&:hover": { color: "#f44336" },
                  transition: "color 0.15s",
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: "0.95rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        ))}

        {/* Add compartment */}
        <Button
          size="small"
          startIcon={<AddIcon sx={{ fontSize: "0.8rem !important" }} />}
          onClick={(e) => {
            e.stopPropagation();
            handleAddCompartment(equipId);
          }}
          sx={{
            alignSelf: "flex-start",
            color: theme.palette.secondary.main,
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "none",
            px: 1,
            py: 0.35,
            mt: 0.25,
            border: `1px dashed ${theme.palette.secondary.main}40`,
            borderRadius: 1,
            "&:hover": {
              bgcolor: `${theme.palette.secondary.main}10`,
              border: `1px dashed ${theme.palette.secondary.main}80`,
            },
          }}
        >
          Add compartment
        </Button>
      </Box>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: theme.palette.primary.main,
          border: `1px solid ${theme.palette.secondary.main}30`,
          borderRadius: isMobile ? 0 : 2,
          boxShadow: `0 0 60px ${theme.palette.secondary.main}20, 0 20px 60px rgba(0,0,0,0.6)`,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: `${theme.palette.primary.main}cc`,
          borderBottom: `1px solid ${theme.palette.secondary.main}25`,
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#f0f0f0",
            }}
          >
            Assign Equipment
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            Assign equipment to an apparatus — split across multiple
            compartments
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          overflowY: "auto",
          flexGrow: 1,
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        {/* Apparatus dropdown */}
        <TextField
          select
          label="Apparatus"
          value={selectedEngineId}
          onChange={(e) => setSelectedEngineId(Number(e.target.value))}
          fullWidth
          variant="outlined"
          sx={fieldSx}
        >
          <MenuItem value="" disabled sx={{ color: "rgba(255,255,255,0.3)" }}>
            Select apparatus
          </MenuItem>
          {engines.map((e) => (
            <MenuItem key={e.id} value={e.id}>
              {e.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Section header + search */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.4)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Available Equipment
            </Typography>

            {selectedCount > 0 && (
              <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                <Chip
                  label={`${selectedCount} item${selectedCount > 1 ? "s" : ""}`}
                  size="small"
                  sx={{
                    bgcolor: `${theme.palette.secondary.main}20`,
                    color: theme.palette.secondary.main,
                    border: `1px solid ${theme.palette.secondary.main}40`,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
                <Chip
                  label={`${totalRows} row${totalRows > 1 ? "s" : ""} to assign`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              </Box>
            )}
          </Box>

          <EquipmentSearchFilter
            equipments={equipments}
            value={searchQuery}
            onQueryChange={setSearchQuery}
            showResultCount
          />
        </Box>

        {/* ---- Mobile card list ---- */}
        {isMobile ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredEquipments.map((eq) => {
              const isChecked = Boolean(selected[eq.id]);
              return (
                <Box
                  key={eq.id}
                  sx={{
                    borderRadius: 1.5,
                    border: `1px solid ${
                      isChecked
                        ? `${theme.palette.secondary.main}50`
                        : "rgba(255,255,255,0.08)"
                    }`,
                    bgcolor: isChecked
                      ? `${theme.palette.secondary.main}10`
                      : "rgba(255,255,255,0.03)",
                    overflow: "hidden",
                    transition: "all 0.15s",
                  }}
                >
                  <Box
                    onClick={() => handleToggle(eq)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      cursor: "pointer",
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleToggle(eq)}
                      sx={checkboxSx}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isChecked ? "#fff" : "rgba(255,255,255,0.75)",
                          fontWeight: isChecked ? 600 : 400,
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {eq.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {eq.total_in_service ?? 0} in service
                      </Typography>
                    </Box>
                    {isChecked && (
                      <Chip
                        label={`${selected[eq.id].compartments.length} compartment${
                          selected[eq.id].compartments.length > 1 ? "s" : ""
                        }`}
                        size="small"
                        sx={{
                          bgcolor: `${theme.palette.secondary.main}15`,
                          color: theme.palette.secondary.main,
                          border: `1px solid ${theme.palette.secondary.main}30`,
                          fontSize: "0.65rem",
                          height: 18,
                        }}
                      />
                    )}
                  </Box>

                  <Collapse in={isChecked}>
                    <Box
                      sx={{
                        px: 1.5,
                        pb: 1.5,
                        pt: 1.25,
                        borderTop: `1px solid ${theme.palette.secondary.main}20`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CompartmentRows
                        equipId={eq.id}
                        maxQty={eq.total_in_service ?? 99}
                      />
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        ) : (
          /* ---- Desktop table ---- */
          <TableContainer
            sx={{
              borderRadius: 1.5,
              border: "1px solid rgba(255,255,255,0.08)",
              maxHeight: 400,
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 3,
              },
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={headerCellSx} />
                  <TableCell sx={headerCellSx}>Equipment</TableCell>
                  <TableCell align="center" sx={headerCellSx}>
                    In Service
                  </TableCell>
                  <TableCell sx={{ ...headerCellSx, minWidth: 380 }}>
                    Compartments
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEquipments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{
                        ...cellSx,
                        py: 4,
                        color: "rgba(255,255,255,0.2)",
                        fontStyle: "italic",
                      }}
                    >
                      No equipment matches your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipments.map((eq) => {
                    const isChecked = Boolean(selected[eq.id]);
                    return (
                      <TableRow
                        key={eq.id}
                        onClick={() => handleToggle(eq)}
                        sx={{
                          cursor: "pointer",
                          verticalAlign: "top",
                          bgcolor: isChecked
                            ? `${theme.palette.secondary.main}08`
                            : "transparent",
                          "&:hover": {
                            bgcolor: isChecked
                              ? `${theme.palette.secondary.main}12`
                              : "rgba(255,255,255,0.03)",
                          },
                          transition: "background 0.15s",
                        }}
                      >
                        {/* Checkbox */}
                        <TableCell
                          padding="checkbox"
                          sx={{
                            ...cellSx,
                            pl: 1.5,
                            verticalAlign: "top",
                            pt: 1.5,
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleToggle(eq)}
                            sx={checkboxSx}
                          />
                        </TableCell>

                        {/* Name */}
                        <TableCell
                          sx={{ ...cellSx, verticalAlign: "top", pt: 1.5 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: isChecked
                                ? "#fff"
                                : "rgba(255,255,255,0.75)",
                              fontWeight: isChecked ? 600 : 400,
                              fontSize: "0.825rem",
                            }}
                          >
                            {eq.name}
                          </Typography>
                        </TableCell>

                        {/* In service */}
                        <TableCell
                          align="center"
                          sx={{ ...cellSx, verticalAlign: "top", pt: 1.5 }}
                        >
                          <Chip
                            label={eq.total_in_service ?? 0}
                            size="small"
                            sx={{
                              bgcolor: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.6)",
                              fontSize: "0.7rem",
                              height: 20,
                            }}
                          />
                        </TableCell>

                        {/* Compartments column */}
                        <TableCell
                          sx={{ ...cellSx, py: 1, minWidth: 380 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isChecked ? (
                            <CompartmentRows
                              equipId={eq.id}
                              maxQty={eq.total_in_service ?? 99}
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{ color: "rgba(255,255,255,0.15)" }}
                            >
                              — select to configure
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <Divider
        sx={{ borderColor: `${theme.palette.secondary.main}20`, flexShrink: 0 }}
      />

      <DialogActions sx={{ px: 3, py: 1.5, gap: 1, flexShrink: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            color: "rgba(255,255,255,0.5)",
            borderColor: "rgba(255,255,255,0.15)",
            "&:hover": {
              borderColor: "rgba(255,255,255,0.35)",
              color: "rgba(255,255,255,0.85)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          disabled={!selectedEngineId || selectedCount === 0 || loading}
          startIcon={<AssignmentTurnedInOutlinedIcon />}
          sx={{
            fontWeight: 700,
            letterSpacing: "0.06em",
            "&.Mui-disabled": { opacity: 0.4 },
          }}
        >
          {totalRows > 0
            ? `Assign (${totalRows} row${totalRows > 1 ? "s" : ""})`
            : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
