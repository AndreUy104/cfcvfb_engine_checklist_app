"use client";

import { useState } from "react";
import EquipmentTable from "@/components/EquipmentTable";
import { getEquipmentColumns } from "@/components/EquipmentTable/columns";
import { Equipment } from "@/utilities/types/equipment.types";
import { messageEnum } from "@/utilities/constants/message.constant";
import { Box, Button, Typography } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AddNewApparatusModal from "@/components/AddNewApparatusModal";
import AddNewEquipmentModal from "@/components/AddNewEquipmentModal";
import AssignEquipmentModal from "@/components/AssignEquipmentToApparatusModal";
import { Apparatus } from "@/utilities/types/apparatus.types";

const SAMPLE_DATA: Equipment[] = [
  { id: 1, name: "HOLMATRO CUTTER",    total: 4,  inService: 3, down: 1 },
  { id: 2, name: "SCBA PACK - GEN 3",  total: 12, inService: 11, down: 1 },
  { id: 3, name: "DEFIBRILLATOR LP15", total: 5,  inService: 3, down: 2 },
  { id: 4, name: "THERMAL CAMERA K65", total: 3,  inService: 2, down: 1 },
  { id: 5, name: "FORCIBLE ENTRY AXE", total: 8,  inService: 8, down: 0 },
  { id: 6, name: "HALLIGAN BAR",        total: 6,  inService: 6, down: 0 },
  { id: 7, name: "HYDRAULIC SPREADER",  total: 3,  inService: 1, down: 2 },
];

const SAMPLE_APPARATUS: Partial<Apparatus>[] = [
  { id: 1, name: "Engine 1" },
  { id: 2, name: "Engine 2" },
  { id: 3, name: "Tanker 1" },
];

type ModalType = "apparatus" | "equipment" | "assign";

interface ModalState {
  type: ModalType | null;
}


export default function InventoryPage() {
  const [rows, setRows] = useState<Equipment[]>(SAMPLE_DATA);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isOpen, setIsOpen] = useState<ModalState>({ type: null });

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
    setIsOpen({ type: "apparatus" });
  }

  function handleAddEquipment() {
    setIsOpen({ type: "equipment" });
  }

  function handleAssignEquipment() {
    setIsOpen({ type: "assign" });
  }

  function handleCloseModal() {
    setIsOpen({ type: null });
  }

  const btnBaseSx = {
    fontWeight: 700,
    fontSize: "0.75rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    borderRadius: 1.5,
    px: 2,
    py: 1,
    width: { xs: "100%", sm: "auto" },
  };

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: "100%", md: "auto" },
          minWidth: 0,
          overflowX: "hidden",
          mt: { xs: "64px", md: 0 },
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          gap={{ xs: 2, sm: 0 }}
          mb={3}
        >
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
      <AddNewApparatusModal
        isOpen={isOpen.type === "apparatus"}
        onClose={handleCloseModal}
      />
      <AddNewEquipmentModal
        isOpen={isOpen.type === "equipment"}
        onClose={handleCloseModal}
      />
      <AssignEquipmentModal
        isOpen={isOpen.type === "assign"}
        onClose={handleCloseModal}
        apparatus={SAMPLE_APPARATUS}
        equipment={SAMPLE_DATA}
      />
    </>
  );
}
