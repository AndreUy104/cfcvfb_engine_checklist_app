"use client";

import { useState, useEffect } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useIssues } from "@/hooks/useIssues";
import { useInspectionHistory } from "@/hooks/useInspectionHistory";
import { useEngine } from "@/hooks/useEngine";
import IssuesTab from "@/components/Report/IssueTab";
import InspectionHistoryTab from "@/components/Report/InspectionHistoryTab";

export default function ReportsPage() {
  const [tab, setTab] = useState(0);

  const {
    issues,
    loading: issuesLoading,
    error: issuesError,
    fetchIssues,
  } = useIssues();
  const {
    engineInspections,
    powerToolInspections,
    loading: inspectionLoading,
    error: inspectionError,
    fetchEngineInspections,
    fetchPowerToolInspections,
  } = useInspectionHistory();
  const { engines, fetchEngines } = useEngine();

  useEffect(() => {
    fetchIssues();
    fetchEngineInspections();
    fetchPowerToolInspections();
    fetchEngines();
  }, []);

  return (
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
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Reports
        </Typography>
        <Typography color="text.secondary">
          Issue tracking and inspection history
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Issues" />
        <Tab label="Inspection History" />
      </Tabs>

      {tab === 0 && (
        <IssuesTab
          issues={issues}
          loading={issuesLoading}
          error={issuesError}
          onRefresh={fetchIssues}
        />
      )}

      {tab === 1 && (
        <InspectionHistoryTab
          engineInspections={engineInspections}
          powerToolInspections={powerToolInspections}
          engines={engines}
          loading={inspectionLoading}
          error={inspectionError}
          onEngineFilterChange={fetchEngineInspections}
        />
      )}
    </Box>
  );
}
