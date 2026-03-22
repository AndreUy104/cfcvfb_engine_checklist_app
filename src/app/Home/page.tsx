"use client";

import { useState, useEffect } from "react";
import ApparatusCard from "@/components/ApparatusCard";
import EngineCheckModal from "@/components/EngineChecklistModal";
import ApparatusEditModal, {
  EngineEditFormData,
} from "@/components/ApparatusEditModal";
import {
  Box,
  Grid,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { messageEnum } from "@/utilities/constants/message.constant";
import { useAuth } from "@/hooks/useAuth";
import { useEngine } from "@/hooks/useEngine";
import { useEngineEquipment } from "@/hooks/useEngineEquipment";
import { useInspection } from "@/hooks/useInspection";
import { EngineWithType } from "@/utilities/types/engine.types";
import AddIcon from "@mui/icons-material/Add";
import ReportIssueModal from "@/components/Report/IssueTab/ReportIssueModal";
import { ENGINE_STATUS } from "@/utilities/constants/apparatus.constant";
import { PERMISSION } from "@/utilities/constants/auth.constant";
import ApparatusDetailsModal from "@/components/ApparatusDetailsModal";

type EngineStatus = (typeof ENGINE_STATUS)[keyof typeof ENGINE_STATUS];

type ModalType = "engineCheck" | "view" | "edit" | null;

interface ModalState {
  type: ModalType;
  engine: EngineWithType | null;
}

export default function HomePage() {
  const [tab, setTab] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: null, engine: null });

  const { positionId } = useAuth();
  const canEdit =
    positionId !== null &&
    (PERMISSION.OIC_AND_OFFICER as readonly number[]).includes(positionId);

  const {
    engines,
    loading: enginesLoading,
    error: enginesError,
    fetchEngines,
    updateEngine,
  } = useEngine();

  const {
    assignments,
    loading: equipmentLoading,
    fetchEquipmentByEngine,
    unassignEquipment,
  } = useEngineEquipment();

  const {
    inspections,
    loading: inspectionLoading,
    fetchInspectionsByEngine,
  } = useInspection();

  const latestInspection = inspections[0] ?? null;

  useEffect(() => {
    fetchEngines();
  }, []);

  async function handleStartCheck(engine: EngineWithType) {
    setModal({ type: "engineCheck", engine });
    await fetchEquipmentByEngine(engine.id);
  }

  async function handleViewEngine(engine: EngineWithType) {
    setModal({ type: "view", engine });
    await Promise.all([
      fetchEquipmentByEngine(engine.id),
      fetchInspectionsByEngine(engine.id),
    ]);
  }

  async function handleEditEngine(engine: EngineWithType) {
    setModal({ type: "edit", engine });
    await fetchEquipmentByEngine(engine.id);
  }

  function handleCloseModal() {
    setModal({ type: null, engine: null });
  }

  async function handleSaveEngine(
    engineId: number,
    data: EngineEditFormData,
  ): Promise<boolean> {
    await updateEngine(engineId, {
      status: data.status,
      plate_number: data.plate_number,
      water_capacity: data.water_capacity ? Number(data.water_capacity) : null,
    });
    return true;
  }

  async function handleRemoveEquipment(
    engineEquipmentId: number,
  ): Promise<boolean> {
    await unassignEquipment(engineEquipmentId);
    return true;
  }

  const filteredEngines =
    tab === 1
      ? engines.filter((e) => e.Engine_type?.type === "Fighting")
      : tab === 2
        ? engines.filter((e) => e.Engine_type?.type === "Tanker")
        : engines;

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: "100%", md: "auto" },
          overflowX: "hidden",
          mt: { xs: "64px", md: 0 },
        }}
      >
        {/* Header */}
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
              APPARATUS DASHBOARD
            </Typography>
            <Typography
              color="gray"
              sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
            >
              {messageEnum.DashboardDetails}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setReportModalOpen(true)}
          >
            Report Issue
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          textColor="secondary"
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ mb: 3 }}
        >
          <Tab label="All Engines" />
          <Tab label="Engines" />
          <Tab label="Tankers" />
        </Tabs>

        {/* Loading / error states */}
        {enginesLoading && (
          <Box display="flex" justifyContent="center" mt={6}>
            <CircularProgress color="secondary" />
          </Box>
        )}

        {enginesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {enginesError}
          </Alert>
        )}

        {/* Grid */}
        {!enginesLoading && !enginesError && (
          <Grid
            container
            spacing={{ xs: 2, sm: 3 }}
            mt={1}
            sx={{ p: { xs: 0, sm: 1, md: 3 } }}
          >
            {filteredEngines.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Typography color="gray" textAlign="center">
                  No engines found.
                </Typography>
              </Grid>
            ) : (
              filteredEngines.map((engine) => (
                <Grid key={engine.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <ApparatusCard
                    id={engine.id}
                    title={engine.name ?? "Unnamed Engine"}
                    status={
                      (engine.status as EngineStatus) ?? ENGINE_STATUS.READY
                    }
                    onClick={() => handleViewEngine(engine)}
                    onStartCheck={() => handleStartCheck(engine)}
                    onEdit={() => handleEditEngine(engine)}
                    canEdit={canEdit}
                  />
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>

      {/* Engine Check Modal */}
      <EngineCheckModal
        isOpen={modal.type === "engineCheck"}
        onClose={handleCloseModal}
        apparatus={
          modal.engine
            ? { id: modal.engine.id, name: modal.engine.name ?? "" }
            : undefined
        }
        assignedEquipment={assignments}
        equipmentLoading={equipmentLoading}
      />

      {/* View Modal */}
      <ApparatusDetailsModal
        isOpen={modal.type === "view"}
        onClose={handleCloseModal}
        engine={modal.engine}
        assignedEquipment={assignments}
        equipmentLoading={equipmentLoading}
        lastInspection={latestInspection}
        inspectionLoading={inspectionLoading}
      />

      {/* Edit Modal — only mounted when the user has edit access */}
      {canEdit && (
        <ApparatusEditModal
          isOpen={modal.type === "edit"}
          onClose={handleCloseModal}
          engine={modal.engine}
          assignedEquipment={assignments}
          equipmentLoading={equipmentLoading}
          onSave={handleSaveEngine}
          onRemoveEquipment={handleRemoveEquipment}
          onAssigned={() =>
            modal.engine && fetchEquipmentByEngine(modal.engine.id)
          }
        />
      )}

      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </>
  );
}
