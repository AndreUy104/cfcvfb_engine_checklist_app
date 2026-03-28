"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getPowerToolColumns } from "./columns";
import { Equipment } from "@/utilities/types/equipment.types";
import PowerToolCheckModal from "../PowerToolsChecklistModal";
import EditPowerToolModal from "../EditPowerToolModal";
import { useEquipment } from "@/hooks/useEquipment";
import { PERMISSION } from "@/utilities/constants/auth.constant";
import { useAuth } from "@/hooks/useAuth";

export default function PowerToolsCheckTable() {
  const {
    powerTools,
    loading,
    error,
    fetchPowerTools,
    updateEquipment,
    deleteEquipment,
  } = useEquipment();

  const { positionId } = useAuth();
  const canEdit =
    positionId !== null &&
    (PERMISSION.OIC_AND_OFFICER as readonly number[]).includes(positionId);
  const canDelete =
    positionId !== null &&
    (PERMISSION.OFFICER_ONLY as readonly number[]).includes(positionId);

  const [selectedTool, setSelectedTool] = useState<Equipment | null>(null);
  const [checkOpen, setCheckOpen] = useState(false);

  function handleCheck(tool: Equipment) {
    setSelectedTool(tool);
    setCheckOpen(true);
  }
  function handleCloseCheck() {
    setCheckOpen(false);
    setSelectedTool(null);
  }

  const [editTool, setEditTool] = useState<Equipment | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  function handleEdit(tool: Equipment) {
    setEditTool(tool);
    setEditOpen(true);
  }
  function handleCloseEdit() {
    setEditOpen(false);
    setEditTool(null);
  }

  async function handleDelete(tool: Equipment) {
    const confirmed = window.confirm(
      `Remove "${tool.name}" from inventory? This cannot be undone.`,
    );
    if (!confirmed) return;
    const ok = await deleteEquipment(tool.id);
    if (ok) fetchPowerTools();
  }

  useEffect(() => {
    fetchPowerTools();
  }, []);

  const columns = getPowerToolColumns({
    onCheck: handleCheck,
    onEdit: canEdit ? handleEdit : undefined,
    onDelete: canDelete ? handleDelete : undefined,
  });

  const downCount = powerTools.filter(
    (t) => t.total_down && t.total_down > 0,
  ).length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header badges */}
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
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.20)",
            }}
          >
            <Typography fontSize="0.75rem" color="#ef4444">
              Down{" "}
              <Box component="span" fontWeight={700}>
                {downCount}
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="secondary" size={32} />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
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
                      ...("sx" in col && col.sx ? (col.sx as object) : {}),
                    }}
                  >
                    {col.label}
                    {col.labelSuffix ?? null}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {powerTools.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 4, color: "text.disabled" }}
                  >
                    No power tools found.
                  </TableCell>
                </TableRow>
              ) : (
                powerTools.map((tool) => (
                  <TableRow
                    key={tool.id}
                    hover
                    sx={{
                      "&:last-child td": { border: 0 },
                      "& td": {
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align ?? "left"}
                        sx={{
                          py: 1.25,
                          ...("sx" in col && col.sx ? (col.sx as object) : {}),
                        }}
                      >
                        {col.renderCell(tool)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Checklist modal */}
      <PowerToolCheckModal
        open={checkOpen}
        tool={selectedTool}
        onClose={handleCloseCheck}
      />

      {/* Edit modal — only mounted for permitted users */}
      {canEdit && (
        <EditPowerToolModal
          key={editTool?.id ?? "closed"}
          open={editOpen}
          tool={editTool}
          onClose={handleCloseEdit}
          onSave={async (id, data) => {
            const ok = await updateEquipment(id, data);
            if (ok) fetchPowerTools();
            return ok;
          }}
        />
      )}
    </Box>
  );
}
