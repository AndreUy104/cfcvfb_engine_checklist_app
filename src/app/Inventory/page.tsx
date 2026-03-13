"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import EquipmentTable from "@/components/EquipmentTable";
import { messageEnum } from "@/utilities/constants/message.constant";
import { Box, Button, Typography } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import { Equipment } from "@/utilities/types/equipment.types";
import { getEquipmentColumns } from "@/components/EquipmentTable/columns";

// ─── Sample data (replace with your API/store data) ───────────────────────────

const SAMPLE_DATA: Equipment[] = [
  {
    id: 1,
    name: "HOLMATRO CUTTER",
    status: "In Service",
    apparatus: "Engine 1",
    lastInspected: "Oct 15, 2023",
  },
  {
    id: 2,
    name: "SCBA PACK - GEN 3",
    status: "In Service",
    apparatus: "Ladder 5",
    lastInspected: "Nov 02, 2023",
  },
  {
    id: 3,
    name: "DEFIBRILLATOR LP15",
    status: "Repair",
    apparatus: "Rescue 2",
    lastInspected: "Sep 20, 2023 (Overdue)",
  },
  {
    id: 4,
    name: "THERMAL CAMERA K65",
    status: "Out of Service",
    apparatus: "Ladder 5",
    lastInspected: "Aug 14, 2023",
  },
  {
    id: 5,
    name: "FORCIBLE ENTRY AXE",
    status: "In Service",
    apparatus: "Engine 1",
    lastInspected: "Oct 12, 2023",
  },
  {
    id: 6,
    name: "HALLIGAN BAR",
    status: "In Service",
    apparatus: "Engine 1",
    lastInspected: "Oct 10, 2023",
  },
  {
    id: 7,
    name: "HYDRAULIC SPREADER",
    status: "Repair",
    apparatus: "Rescue 2",
    lastInspected: "Sep 05, 2023 (Overdue)",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [rows, setRows] = useState<Equipment[]>(SAMPLE_DATA);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const columns = getEquipmentColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  function handleEdit(item: Equipment) {
    // TODO: open your edit modal / drawer
    console.log("edit", item);
  }

  function handleDelete(item: Equipment) {
    // TODO: open your confirm-delete modal
    setRows((prev) => prev.filter((r) => r.id !== item.id));
  }

  function handleAddApparatus() {
    // TODO: open Add Apparatus modal
  }

  function handleAddEquipment() {
    // TODO: open Add Equipment modal
  }

  function handleAssignEquipment() {
    // TODO: open Assign Equipment modal
  }

  // Shared button sx to avoid repetition
  const btnBaseSx = {
    fontWeight: 700,
    fontSize: "0.75rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    borderRadius: 1.5,
    px: 2,
    py: 1,
    // Full-width on xs, auto on sm+
    width: { xs: "100%", sm: "auto" },
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          // Prevent main content from overflowing behind sidebar on mobile
          width: { xs: "100%", md: "auto" },
          minWidth: 0,
          overflowX: "hidden",
          mt: { xs: "64px", md: 0 },
        }}
      >
        {/* ── Header ── */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          gap={{ xs: 2, sm: 0 }}
          mb={3}
        >
          {/* Title */}
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ fontSize: { xs: "1.4rem", sm: "2.125rem" } }}
            >
              Equipment Inventory
            </Typography>
            <Typography
              color="gray"
              sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
            >
              {messageEnum.InventoryDetails}
            </Typography>
          </Box>

          {/* ── Action Buttons ──
               xs: vertical stack, each button full-width
               sm+: horizontal row, auto-width  */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={1.25}
            width={{ xs: "100%", sm: "auto" }}
          >
            <Button
              variant="outlined"
              startIcon={<LocalShippingOutlinedIcon fontSize="small" />}
              onClick={handleAddApparatus}
              sx={{
                ...btnBaseSx,
                color: "#dc2626",
                borderColor: "rgba(220,38,38,0.45)",
                background: "rgba(220,38,38,0.08)",
                "&:hover": {
                  borderColor: "#dc2626",
                  background: "rgba(220,38,38,0.15)",
                },
              }}
            >
              Add Apparatus
            </Button>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={handleAddEquipment}
              sx={{
                ...btnBaseSx,
                background: "#dc2626",
                color: "#fff",
                boxShadow: "0 0 12px rgba(220,38,38,0.30)",
                "&:hover": {
                  background: "#b91c1c",
                  boxShadow: "0 0 18px rgba(220,38,38,0.45)",
                },
              }}
            >
              Add Equipment
            </Button>

            <Button
              variant="outlined"
              startIcon={<AssignmentTurnedInOutlinedIcon fontSize="small" />}
              onClick={handleAssignEquipment}
              sx={{
                ...btnBaseSx,
                color: "text.secondary",
                borderColor: "rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.04)",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Assign Equipment
            </Button>
          </Box>
        </Box>

        {/* ── Table (switches to card list on mobile inside the component) ── */}
        <EquipmentTable
          columns={columns}
          rows={rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={rows.length}
          onPageChange={setPage}
          onRowsPerPageChange={(rpp) => {
            setRowsPerPage(rpp);
            setPage(0);
          }}
        />
      </Box>
    </Box>
  );
}
