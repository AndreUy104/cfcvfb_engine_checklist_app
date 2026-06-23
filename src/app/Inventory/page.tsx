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
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
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

import { usePpe } from "@/hooks/usePpe";
import { PpeItemWithAvailable } from "@/utilities/types/ppe.types";
import AddNewPpeModal from "@/components/Addnewppemodal";
import DeletePpeModal from "@/components/Deleteppemodal";
import IssueReturnPpeModal from "@/components/Issuereturnppemodal";
import PpeSearchFilter, { usePpeSearch } from "@/components/Ppesearchfilter";
import PpeStatCards from "@/components/Ppestatcards";
import PpeTable from "@/components/Ppetable";
import { getPpeColumns } from "@/components/Ppetable/columns";
import PpeTransactionLog from "@/components/Ppetransactionlog";

type ModalType = "apparatus" | "equipment" | "assign" | "edit" | "delete";

interface ModalState {
  type: ModalType | null;
  target?: Equipment | null;
}

type PpeModalType = "add" | "edit" | "delete" | "issue-return";

interface PpeModalState {
  type: PpeModalType | null;
  target?: PpeItemWithAvailable | null;
}

const TAB_EQUIPMENT = 0;
const TAB_PPE = 1;

export default function InventoryPage() {
  const { positionId } = useAuth();
  const canManageInventory = positionId === 2 || positionId === 3;

  const [activeTab, setActiveTab] = useState(TAB_EQUIPMENT);

  const {
    equipments,
    loading: equipmentLoading,
    error: equipmentError,
    fetchEquipments,
  } = useEquipment();

  const { engines, error: engineError, fetchEngines } = useEngine();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modal, setModal] = useState<ModalState>({ type: null, target: null });

  const { query, setQuery, filteredEquipments } =
    useEquipmentSearch(equipments);

  const columns = getEquipmentColumns({
    positionId,
    onEdit: (row) => setModal({ type: "edit", target: row }),
    onDelete: (row) => setModal({ type: "delete", target: row }),
  });

  function handleCloseModal() {
    setModal({ type: null, target: null });
  }

  // ===================== PPE =====================

  const {
    ppeItems,
    loading: ppeLoading,
    error: ppeError,
    fetchPpeItems,
  } = usePpe();

  const [ppePage, setPpePage] = useState(0);
  const [ppeRowsPerPage, setPpeRowsPerPage] = useState(5);
  const [ppeModal, setPpeModal] = useState<PpeModalState>({
    type: null,
    target: null,
  });

  // Bumped after a successful issue/return so PpeTransactionLog re-fetches
  // immediately, even if the user doesn't touch its filters/pagination.
  const [logRefreshKey, setLogRefreshKey] = useState(0);

  const {
    query: ppeQuery,
    setQuery: setPpeQuery,
    category: ppeCategory,
    setCategory: setPpeCategory,
    filteredPpeItems,
  } = usePpeSearch(ppeItems);

  const ppeColumns = getPpeColumns({
    positionId,
    onEdit: (row) => setPpeModal({ type: "edit", target: row }),
    onDelete: (row) => setPpeModal({ type: "delete", target: row }),
  });

  function handleClosePpeModal() {
    setPpeModal({ type: null, target: null });
  }

  // Eager-load both Equipment and PPE data on page load, regardless of
  // which tab is active first — keeps both tabs equally "ready" the moment
  // the user switches, rather than one tab flashing a loading state.
  useEffect(() => {
    fetchEquipments();
    fetchEngines();
    fetchPpeItems();
  }, []);

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
        <Box mb={2}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.4rem", sm: "2.125rem" } }}
          >
            {activeTab === TAB_EQUIPMENT
              ? "Equipment Inventory"
              : "PPE Inventory"}
          </Typography>
          <Typography
            color="gray"
            sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
          >
            {activeTab === TAB_EQUIPMENT
              ? messageEnum.InventoryDetails
              : "Track PPE stock and issue/return history for firefighters."}
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, next) => setActiveTab(next)}
          sx={{
            mb: 3,
            borderBottom: "1px solid rgba(220,38,38,0.20)",
            "& .MuiTab-root": {
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              minHeight: 44,
            },
            "& .Mui-selected": { color: "#dc2626 !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#dc2626" },
          }}
        >
          <Tab label="Fire Fighting Equipment" value={TAB_EQUIPMENT} />
          <Tab label="PPE" value={TAB_PPE} />
        </Tabs>

        {/* ===================== Equipment Tab (unchanged) ===================== */}
        {activeTab === TAB_EQUIPMENT && (
          <>
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems={{ xs: "flex-start", sm: "center" }}
              flexDirection={{ xs: "column", sm: "row" }}
              gap={{ xs: 2, sm: 0 }}
              mb={3}
            >
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
                    startIcon={
                      <AssignmentTurnedInOutlinedIcon fontSize="small" />
                    }
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
          </>
        )}

        {/* ===================== PPE Tab ===================== */}
        {activeTab === TAB_PPE && (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              flexDirection={{ xs: "column", sm: "row" }}
              gap={{ xs: 2, sm: 0 }}
              mb={3}
            >
              <Box flex={1} />

              {canManageInventory && (
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={1.25}
                  width={{ xs: "100%", sm: "auto" }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<SwapHorizOutlinedIcon fontSize="small" />}
                    onClick={() => setPpeModal({ type: "issue-return" })}
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
                    Issue / Return PPE
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon fontSize="small" />}
                    onClick={() => setPpeModal({ type: "add" })}
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
                    Add PPE
                  </Button>
                </Box>
              )}
            </Box>

            {ppeError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {ppeError}
              </Alert>
            )}

            {!ppeLoading && <PpeStatCards ppeItems={ppeItems} />}

            {!ppeLoading && (
              <Box sx={{ mb: 2 }}>
                <PpeSearchFilter
                  ppeItems={ppeItems}
                  value={ppeQuery}
                  onQueryChange={setPpeQuery}
                  category={ppeCategory}
                  onCategoryChange={setPpeCategory}
                  showResultCount
                  variant="page"
                />
              </Box>
            )}

            {ppeLoading ? (
              <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress color="secondary" />
              </Box>
            ) : (
              <PpeTable
                columns={ppeColumns}
                rows={filteredPpeItems.slice(
                  ppePage * ppeRowsPerPage,
                  ppePage * ppeRowsPerPage + ppeRowsPerPage,
                )}
                page={ppePage}
                rowsPerPage={ppeRowsPerPage}
                totalCount={filteredPpeItems.length}
                onPageChange={setPpePage}
                onRowsPerPageChange={(rpp) => {
                  setPpeRowsPerPage(rpp);
                  setPpePage(0);
                }}
              />
            )}

            <Divider sx={{ my: 4, borderColor: "rgba(220,38,38,0.15)" }} />

            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 2, fontSize: { xs: "1.05rem", sm: "1.25rem" } }}
            >
              Issuance Log
            </Typography>
            <PpeTransactionLog ppeItems={ppeItems} refreshKey={logRefreshKey} />
          </>
        )}
      </Box>

      {/* ── Equipment Modals (unchanged) ── */}
      {canManageInventory && (
        <>
          <AddNewApparatusModal
            isOpen={modal.type === "apparatus"}
            onClose={handleCloseModal}
            onSuccess={fetchEngines}
          />

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

      {/* ── PPE Modals ── */}
      {canManageInventory && (
        <>
          <AddNewPpeModal
            key={ppeModal.type === "add" ? "add" : "add-inactive"}
            isOpen={ppeModal.type === "add"}
            onClose={handleClosePpeModal}
            onSuccess={fetchPpeItems}
          />

          <AddNewPpeModal
            key={ppeModal.target?.id ?? "edit"}
            isOpen={ppeModal.type === "edit"}
            onClose={handleClosePpeModal}
            onSuccess={fetchPpeItems}
            editTarget={ppeModal.target}
          />

          <DeletePpeModal
            isOpen={ppeModal.type === "delete"}
            onClose={handleClosePpeModal}
            onSuccess={fetchPpeItems}
            target={ppeModal.target ?? null}
          />

          <IssueReturnPpeModal
            isOpen={ppeModal.type === "issue-return"}
            onClose={handleClosePpeModal}
            onSuccess={() => {
              fetchPpeItems();
              setLogRefreshKey((k) => k + 1);
            }}
            ppeItems={ppeItems}
          />
        </>
      )}
    </>
  );
}
