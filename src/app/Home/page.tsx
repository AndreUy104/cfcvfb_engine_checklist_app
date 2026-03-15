"use client";

import { useState, useEffect } from "react";
import ApparatusCard from "@/components/ApparatusCard";
import EngineCheckModal from "@/components/EngineChecklistModal";
import {
  Box,
  Grid,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { messageEnum } from "@/utilities/constants/message.constant";
import { useEngine } from "@/hooks/useEngine";
import { useEngineEquipment } from "@/hooks/useEngineEquipment";
import { EngineWithType } from "@/utilities/types/engine.types";

type ModalType = "engineCheck" | null;

interface ModalState {
  type: ModalType;
  engine: EngineWithType | null;
}

export default function HomePage() {
  const [tab, setTab] = useState(0);
  const [modal, setModal] = useState<ModalState>({ type: null, engine: null });

  const { engines, loading, error, fetchEngines } = useEngine();
  const {
    assignments,
    loading: equipmentLoading,
    fetchEquipmentByEngine,
  } = useEngineEquipment();

  useEffect(() => {
    fetchEngines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStartCheck(engine: EngineWithType) {
    setModal({ type: "engineCheck", engine });
    await fetchEquipmentByEngine(engine.id);
  }

  function handleCloseModal() {
    setModal({ type: null, engine: null });
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

        {/* States */}
        {loading && (
          <Box display="flex" justifyContent="center" mt={6}>
            <CircularProgress color="secondary" />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Grid */}
        {!loading && !error && (
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
                      (engine.status as "ready" | "progress" | "alert") ??
                      "ready"
                    }
                    onStartCheck={() => handleStartCheck(engine)}
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
    </>
  );
}
