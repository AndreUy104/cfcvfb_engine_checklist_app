"use client";

import { useState } from "react";
import ApparatusCard from "@/components/ApparatusCard";
import EngineCheckModal from "@/components/EngineChecklistModal";
import { Box, Grid, Tab, Tabs, Typography } from "@mui/material";
import { messageEnum } from "@/utilities/constants/message.constant";
import { Apparatus } from "@/utilities/types/apparatus.types";
import { Equipment } from "@/utilities/types/equipment.types";

type ModalType = "engineCheck" | null;

interface ModalState {
  type: ModalType;
  apparatus: Partial<Apparatus> | null;
  assignedEquipment: Partial<Equipment>[];
}

const APPARATUS_LIST = [
  { id: 1, title: "Engine 1", status: "ready" as const, type: "Fighting" },
  { id: 2, title: "Ladder 5", status: "progress" as const, type: "Fighting" },
  { id: 3, title: "Rescue 1", status: "alert" as const, type: "Tanker" },
  { id: 4, title: "Engine 2", status: "ready" as const, type: "Fighting" },
];

const EQUIPMENT_BY_APPARATUS: Record<number, Partial<Equipment>[]> = {
  1: [
    { id: 1, name: "HOLMATRO CUTTER", inService: 3 },
    { id: 2, name: "SCBA PACK - GEN 3", inService: 11 },
    { id: 3, name: "HALLIGAN BAR", inService: 6 },
  ],
  2: [
    { id: 4, name: "THERMAL CAMERA K65", inService: 2 },
    { id: 5, name: "DEFIBRILLATOR LP15", inService: 3 },
  ],
  3: [{ id: 6, name: "HYDRAULIC SPREADER", inService: 1 }],
  4: [
    { id: 1, name: "HOLMATRO CUTTER", inService: 3 },
    { id: 7, name: "FORCIBLE ENTRY AXE", inService: 8 },
  ],
};

export default function HomePage() {
  const [tab, setTab] = useState(0);
  const [modal, setModal] = useState<ModalState>({
    type: null,
    apparatus: null,
    assignedEquipment: [],
  });

  function handleStartCheck(apparatus: Partial<Apparatus>, id: number) {
    setModal({
      type: "engineCheck",
      apparatus,
      assignedEquipment: EQUIPMENT_BY_APPARATUS[id] ?? [],
    });
  }

  function handleCloseModal() {
    setModal({ type: null, apparatus: null, assignedEquipment: [] });
  }

  const filteredApparatus =
    tab === 1
      ? APPARATUS_LIST.filter((a) => a.type === "Fighting")
      : tab === 2
        ? APPARATUS_LIST.filter((a) => a.type === "Tanker")
        : APPARATUS_LIST;

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

          {/* <Button
            variant="contained"
            color="secondary"
            sx={{ width: { xs: "100%", sm: "auto" }, mt: { xs: 1, sm: 0 } }}
          >
            + New Report
          </Button> */}
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

        {/* Grid */}
        <Grid
          container
          spacing={{ xs: 2, sm: 3 }}
          mt={1}
          sx={{ p: { xs: 0, sm: 1, md: 3 } }}
        >
          {filteredApparatus.map((a) => (
            <Grid key={a.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <ApparatusCard
                title={a.title}
                status={a.status}
                onStartCheck={() =>
                  handleStartCheck({ id: a.id, name: a.title }, a.id)
                }
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Engine Check Modal */}
      <EngineCheckModal
        isOpen={modal.type === "engineCheck"}
        onClose={handleCloseModal}
        apparatus={modal.apparatus ?? undefined}
        assignedEquipment={modal.assignedEquipment}
      />
    </>
  );
}
