"use client";

import { useEffect, useState } from "react";
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
import DeleteEquipmentModal from "@/components/DeleteEquipmentModal";
import AssignEquipmentModal from "@/components/AssignEquipmentToApparatusModal";
import EquipmentSearchFilter, {
  useEquipmentSearch,
} from "@/components/EquipmentSearchFilter";
import { useAuth } from "@/hooks/useAuth";
import { useEquipment } from "@/hooks/useEquipment";
import { useEngine } from "@/hooks/useEngine";
import { Equipment } from "@/utilities/types/equipment.types";

type ModalType = "apparatus" | "equipment" | "assign" | "edit" | "delete";

interface ModalState {
  type: ModalType | null;
  target?: Equipment | null;
}

export default function InventoryPage() {
  const {
    equipments,
    loading: equipmentLoading,
    error: equipmentError,
    fetchEquipments,
  } = useEquipment();

  const { engines, error: engineError, fetchEngines } = useEngine();

  const { positionId } = useAuth();
  const canManageInventory = positionId === 2 || positionId === 3;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modal, setModal] = useState<ModalState>({ type: null, target: null });

  const { query, setQuery, filteredEquipments } =
    useEquipmentSearch(equipments);

  useEffect(() => {
    fetchEquipments();
    fetchEngines();
  }, []);

  const columns = getEquipmentColumns({
    positionId,
    onEdit: (row) => setModal({ type: "edit", target: row }),
    onDelete: (row) => setModal({ type: "delete", target: row }),
  });

  function handleCloseModal() {
    setModal({ type: null, target: null });
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
        {/* Page header */}
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

          {canManageInventory && (
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={1.25}
              width={{ xs: "100%", sm: "auto" }}
            >
              <Button
                variant="outlined"
                startIcon={<LocalShippingOutlinedIcon fontSize="small" />}
                onClick={() => setModal({ type: "apparatus" })}
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
                onClick={() => setModal({ type: "equipment" })}
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
                onClick={() => setModal({ type: "assign" })}
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
          )}
        </Box>

        {(equipmentError || engineError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {equipmentError ?? engineError}
          </Alert>
        )}

        {/* Search bar */}
        {!equipmentLoading && (
          <Box sx={{ mb: 2 }}>
            <EquipmentSearchFilter
              equipments={equipments}
              value={query}
              onQueryChange={setQuery}
              showResultCount
              variant="page"
            />
          </Box>
        )}

        {equipmentLoading ? (
          <Box display="flex" justifyContent="center" mt={6}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <EquipmentTable
            columns={columns}
            rows={filteredEquipments.slice(
              page * rowsPerPage,
              page * rowsPerPage + rowsPerPage,
            )}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredEquipments.length}
            onPageChange={setPage}
            onRowsPerPageChange={(rpp) => {
              setRowsPerPage(rpp);
              setPage(0);
            }}
          />
        )}
      </Box>

      {/* ── Modals ── */}
      {canManageInventory && (
        <>
          <AddNewApparatusModal
            isOpen={modal.type === "apparatus"}
            onClose={handleCloseModal}
            onSuccess={fetchEngines}
          />

          {/* Add mode */}
          <AddNewEquipmentModal
            isOpen={modal.type === "equipment"}
            onClose={handleCloseModal}
            onSuccess={fetchEquipments}
          />

          <AssignEquipmentModal
            isOpen={modal.type === "assign"}
            onClose={handleCloseModal}
            engines={engines}
            equipments={equipments}
          />
        </>
      )}

      {positionId === 3 && (
        <>
          <AddNewEquipmentModal
            key={modal.target?.id ?? "edit"}
            isOpen={modal.type === "edit"}
            onClose={handleCloseModal}
            onSuccess={fetchEquipments}
            editTarget={modal.target}
          />

          <DeleteEquipmentModal
            isOpen={modal.type === "delete"}
            onClose={handleCloseModal}
            onSuccess={fetchEquipments}
            target={modal.target ?? null}
          />
        </>
      )}
    </>
  );
}
