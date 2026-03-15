"use client";

import { useEffect } from "react";
import EquipmentTable from "@/components/EquipmentTable";
import { getEquipmentColumns } from "@/components/EquipmentTable/columns";
import { messageEnum } from "@/utilities/constants/message.constant";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AddNewApparatusModal from "@/components/AddNewApparatusModal";
import AddNewEquipmentModal from "@/components/AddNewEquipmentModal";
import AssignEquipmentModal from "@/components/AssignEquipmentToApparatusModal";
import { useEquipment } from "@/hooks/useEquipment";
import { useEngine } from "@/hooks/useEngine";
import { Equipment } from "@/utilities/types/equipment.types";
import { useState } from "react";

type ModalType = "apparatus" | "equipment" | "assign";

interface ModalState {
  type: ModalType | null;
}

export default function InventoryPage() {
  const {
    equipments,
    loading: equipmentLoading,
    error: equipmentError,
    fetchEquipments,
    deleteEquipment,
  } = useEquipment();

  const {
    engines,
    loading: engineLoading,
    error: engineError,
    fetchEngines,
  } = useEngine();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isOpen, setIsOpen] = useState<ModalState>({ type: null });

  useEffect(() => {
    fetchEquipments();
    fetchEngines();
  }, []);

  const columns = getEquipmentColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  function handleEdit(item: Equipment) {
    // TODO: open edit modal
    console.log("edit", item);
  }

  async function handleDelete(item: Equipment) {
    await deleteEquipment(item.id);
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
              onClick={() => setIsOpen({ type: "apparatus" })}
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
              onClick={() => setIsOpen({ type: "equipment" })}
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
              onClick={() => setIsOpen({ type: "assign" })}
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

        {(equipmentError || engineError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {equipmentError ?? engineError}
          </Alert>
        )}

        {equipmentLoading ? (
          <Box display="flex" justifyContent="center" mt={6}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <EquipmentTable
            columns={columns}
            rows={equipments.slice(
              page * rowsPerPage,
              page * rowsPerPage + rowsPerPage,
            )}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={equipments.length}
            onPageChange={setPage}
            onRowsPerPageChange={(rpp) => {
              setRowsPerPage(rpp);
              setPage(0);
            }}
          />
        )}
      </Box>

      <AddNewApparatusModal
        isOpen={isOpen.type === "apparatus"}
        onClose={handleCloseModal}
        onSuccess={fetchEngines}
      />
      <AddNewEquipmentModal
        isOpen={isOpen.type === "equipment"}
        onClose={handleCloseModal}
        onSuccess={fetchEquipments}
      />
      <AssignEquipmentModal
        isOpen={isOpen.type === "assign"}
        onClose={handleCloseModal}
        engines={engines}
        equipments={equipments}
      />
    </>
  );
}
