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
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import { useTheme } from "@mui/material/styles";
import { Apparatus } from "@/utilities/types/apparatus.types";
import { Equipment } from "@/utilities/types/equipment.types";

interface SelectedEquipment {
  equipment_id: Equipment["id"];
  quantity_assigned: number;
  location_on_truck: string | null;
}

interface AssignEquipmentToApparatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  apparatus?: Partial<Apparatus>[];
  equipment?: Partial<Equipment>[];
}

const DEFAULT_APPARATUS: Partial<Apparatus>[] = [
  { id: 1, name: "Engine 1" },
  { id: 2, name: "Engine 2" },
  { id: 3, name: "Tanker 1" },
];

const DEFAULT_EQUIPMENT: Partial<Equipment>[] = [
  { id: 1, name: "HOLMATRO CUTTER",    inService: 3  },
  { id: 2, name: "SCBA PACK - GEN 3",  inService: 11 },
  { id: 3, name: "DEFIBRILLATOR LP15", inService: 3  },
  { id: 4, name: "THERMAL CAMERA K65", inService: 2  },
  { id: 5, name: "FORCIBLE ENTRY AXE", inService: 8  },
  { id: 6, name: "HALLIGAN BAR",        inService: 6  },
  { id: 7, name: "HYDRAULIC SPREADER",  inService: 1  },
];

export default function AssignEquipmentToApparatusModal({
  isOpen,
  onClose,
  apparatus = DEFAULT_APPARATUS,
  equipment = DEFAULT_EQUIPMENT,
}: AssignEquipmentToApparatusModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedApparatus, setSelectedApparatus] = useState<Apparatus["id"] | "">("");
  const [selected, setSelected] = useState<Record<Equipment["id"], SelectedEquipment>>({});

  const selectedCount = Object.keys(selected).length;

  function handleToggle(eq: Partial<Equipment>) {
    if (!eq.id) return;
    setSelected((prev) => {
      if (prev[eq.id!]) {
        const next = { ...prev };
        delete next[eq.id!];
        return next;
      }
      return { ...prev, [eq.id!]: { equipment_id: eq.id!, quantity_assigned: 1, location_on_truck: null } };
    });
  }

  function handleField(
    id: Equipment["id"],
    field: keyof Omit<SelectedEquipment, "equipment_id">,
    value: string
  ) {
    setSelected((prev) => {
      if (!prev[id]) return prev;
      const updated = {
        ...prev[id],
        [field]: field === "quantity_assigned" ? Math.max(1, parseInt(value) || 1) : value,
      };
      return { ...prev, [id]: updated };
    });
  }

  function handleSubmit() {
    console.log("Assigning to apparatus:", selectedApparatus);
    console.log("Equipment:", Object.values(selected));
    handleClose();
  }

  function handleClose() {
    setSelectedApparatus("");
    setSelected({});
    onClose();
  }

  // ---- Shared sx ---------------------------------------------------------

  const fieldSx = {
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontWeight: 600 },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.secondary.main },
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
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.secondary.main },
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


  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
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
            Assign equipment to an apparatus
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
        {/* Apparatus dropdown */}
        <TextField
          select
          label="Apparatus"
          value={selectedApparatus}
          onChange={(e) => setSelectedApparatus(Number(e.target.value) as Apparatus["id"])}
          fullWidth
          variant="outlined"
          sx={fieldSx}
        >
          <MenuItem value="" disabled sx={{ color: "rgba(255,255,255,0.3)" }}>
            Select apparatus
          </MenuItem>
          {apparatus.map((a) => (
            <MenuItem key={a.id} value={a.id}>
              {a.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Section label */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            <Chip
              label={`${selectedCount} selected`}
              size="small"
              sx={{
                bgcolor: `${theme.palette.secondary.main}20`,
                color: theme.palette.secondary.main,
                border: `1px solid ${theme.palette.secondary.main}40`,
                fontWeight: 700,
                fontSize: "0.7rem",
              }}
            />
          )}
        </Box>

        {/* Equipment list */}
        {isMobile ? (
          // ---- Mobile: Card list ----
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {equipment.map((eq) => {
              const isChecked = Boolean(eq.id && selected[eq.id]);
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
                  {/* Row */}
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
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
                        {eq.inService ?? 0} in service
                      </Typography>
                    </Box>
                    {isChecked && eq.id && (
                      <TextField
                        type="number"
                        label="Qty"
                        value={selected[eq.id].quantity_assigned}
                        onChange={(e) => handleField(eq.id!, "quantity_assigned", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        inputProps={{ min: 1, max: eq.inService ?? 1 }}
                        size="small"
                        sx={{ ...inlineFieldSx, width: 70 }}
                      />
                    )}
                  </Box>

                  {/* Compartment field — expands when checked */}
                  <Collapse in={isChecked && Boolean(eq.id)}>
                    <Box
                      sx={{
                        px: 1.5,
                        pb: 1.5,
                        borderTop: `1px solid ${theme.palette.secondary.main}20`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TextField
                        label="Compartment"
                        placeholder="e.g. Left Side, Rear, Officer Side"
                        value={eq.id ? selected[eq.id]?.location_on_truck ?? "" : ""}
                        onChange={(e) => handleField(eq.id!, "location_on_truck", e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ ...inlineFieldSx, mt: 1.25 }}
                      />
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        ) : (
          // ---- Desktop: Table ----
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
                  <TableCell align="center" sx={headerCellSx}>In Service</TableCell>
                  <TableCell align="center" sx={headerCellSx}>Qty</TableCell>
                  <TableCell sx={headerCellSx}>Compartment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.map((eq) => {
                  const isChecked = Boolean(eq.id && selected[eq.id]);
                  return (
                    <TableRow
                      key={eq.id}
                      onClick={() => handleToggle(eq)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: isChecked
                          ? `${theme.palette.secondary.main}10`
                          : "transparent",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                        transition: "background 0.15s",
                      }}
                    >
                      {/* Checkbox */}
                      <TableCell padding="checkbox" sx={{ ...cellSx, pl: 1.5 }}>
                        <Checkbox
                          checked={isChecked}
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleToggle(eq)}
                          sx={checkboxSx}
                        />
                      </TableCell>

                      {/* Name */}
                      <TableCell sx={cellSx}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isChecked ? "#fff" : "rgba(255,255,255,0.75)",
                            fontWeight: isChecked ? 600 : 400,
                            fontSize: "0.825rem",
                          }}
                        >
                          {eq.name}
                        </Typography>
                      </TableCell>

                      {/* In Service */}
                      <TableCell align="center" sx={cellSx}>
                        <Chip
                          label={eq.inService ?? 0}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.6)",
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                      </TableCell>

                      {/* Qty */}
                      <TableCell
                        align="center"
                        sx={{ ...cellSx, width: 80 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isChecked && eq.id ? (
                          <TextField
                            type="number"
                            value={selected[eq.id].quantity_assigned}
                            onChange={(e) => handleField(eq.id!, "quantity_assigned", e.target.value)}
                            inputProps={{ min: 1, max: eq.inService ?? 1 }}
                            size="small"
                            sx={{ ...inlineFieldSx, width: 64 }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.2)" }}>
                            —
                          </Typography>
                        )}
                      </TableCell>

                      {/* Compartment */}
                      <TableCell
                        sx={{ ...cellSx, minWidth: 160 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isChecked && eq.id ? (
                          <TextField
                            placeholder="e.g. Left Side, Rear"
                            value={selected[eq.id].location_on_truck ?? ""}
                            onChange={(e) =>
                              handleField(eq.id!, "location_on_truck", e.target.value)
                            }
                            size="small"
                            fullWidth
                            sx={inlineFieldSx}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.2)" }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: `${theme.palette.secondary.main}20`, flexShrink: 0 }} />

      {/* Footer */}
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
          disabled={!selectedApparatus || selectedCount === 0}
          startIcon={<AssignmentTurnedInOutlinedIcon />}
          sx={{
            fontWeight: 700,
            letterSpacing: "0.06em",
            "&.Mui-disabled": { opacity: 0.4 },
          }}
        >
          {selectedCount > 0 ? `Assign (${selectedCount})` : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
