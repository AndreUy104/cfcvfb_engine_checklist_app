"use client";

import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import { getPowerToolColumns } from "./columns";
import { PowerTool } from "@/utilities/types/equipment.types";
import PowerToolCheckModal from "../PowerToolsChecklistModal";

// ── Mock data — replace with your API/store data ──────────────────────────────

const MOCK_TOOLS: PowerTool[] = [
  { id: "T-001", name: "Angle Grinder 4½″", lastChecked: "Today, 06:00", status: "OK" },
  { id: "T-002", name: "Circular Saw 7¼″", lastChecked: "Yesterday", status: "In Repair" },
  { id: "T-003", name: "Rotary Hammer SDS+", lastChecked: "3 days ago", status: "Down" },
  { id: "T-004", name: "Impact Driver 18V", lastChecked: "Today, 06:00", status: "OK" },
  { id: "T-005", name: "Reciprocating Saw", lastChecked: "5 days ago", status: "Down" },
  { id: "T-006", name: "Orbital Sander", lastChecked: "Yesterday", status: "In Repair" },
  { id: "T-007", name: "Heat Gun 2000W", lastChecked: "Today, 06:00", status: "OK" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PowerToolsCheckTable() {
  const [selectedTool, setSelectedTool] = useState<PowerTool | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCheck = (tool: PowerTool) => {
    setSelectedTool(tool);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTool(null);
  };

  const columns = getPowerToolColumns({ onCheck: handleCheck });
  const overdueCount = MOCK_TOOLS.filter((t) => t.status === "Down").length;

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
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.20)",
            }}
          >
            <Typography fontSize="0.75rem" color="#ef4444">
              Down{" "}
              <Box component="span" fontWeight={700}>
                {overdueCount}
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Table */}
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
                    // Hide less critical columns on mobile
                    display:
                      col.key === "lastChecked"
                        ? { xs: "none", sm: "table-cell" }
                        : "table-cell",
                  }}
                >
                  {col.label}
                  {col.labelSuffix ?? null}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {MOCK_TOOLS.map((tool) => (
              <TableRow
                key={tool.id}
                hover
                sx={{
                  "&:last-child td": { border: 0 },
                  "& td": { borderBottom: "1px solid rgba(255,255,255,0.05)" },
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align ?? "left"}
                    sx={{
                      py: 1.25,
                      display:
                        col.key === "lastChecked"
                          ? { xs: "none", sm: "table-cell" }
                          : "table-cell",
                    }}
                  >
                    {col.renderCell(tool)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PowerToolCheckModal
        open={modalOpen}
        tool={selectedTool}
        onClose={handleCloseModal}
        onSubmit={(data) => {
          console.log("Tool check submitted:", data);
          handleCloseModal();
        }}
      />
    </Box>
  );
}