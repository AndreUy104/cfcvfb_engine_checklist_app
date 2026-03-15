import { useState } from "react";
import { Box, Tab, Tabs, CircularProgress, Alert } from "@mui/material";
import EngineInspectionTable from "./EngineInspectionTable";
import PowerToolInspectionTable from "./PowerToolInspectionTable";
import {
  InspectionWithDetails,
  PowerToolInspectionWithDetails,
} from "@/utilities/types/inspection.types";
import { EngineWithType } from "@/utilities/types/engine.types";

interface InspectionHistoryTabProps {
  engineInspections: InspectionWithDetails[];
  powerToolInspections: PowerToolInspectionWithDetails[];
  engines: EngineWithType[];
  loading: boolean;
  error: string | null;
  onEngineFilterChange: (engineId?: number) => void;
}

export default function InspectionHistoryTab({
  engineInspections,
  powerToolInspections,
  engines,
  loading,
  error,
  onEngineFilterChange,
}: InspectionHistoryTabProps) {
  const [subTab, setSubTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={subTab}
        onChange={(_, v) => setSubTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Engine Inspections" />
        <Tab label="Power Tool Inspections" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {subTab === 0 && (
            <EngineInspectionTable
              inspections={engineInspections}
              engines={engines}
              onFilterChange={onEngineFilterChange}
            />
          )}
          {subTab === 1 && (
            <PowerToolInspectionTable inspections={powerToolInspections} />
          )}
        </>
      )}
    </Box>
  );
}
