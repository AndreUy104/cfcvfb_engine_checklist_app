import { useState, useMemo } from "react";
import {
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import EngineInspectionTable from "./EngineInspectionTable";
import PowerToolInspectionTable from "./PowerToolInspectionTable";
import {
  InspectionWithDetails,
  PowerToolInspectionWithDetails,
} from "@/utilities/types/inspection.types";
import { EngineWithType } from "@/utilities/types/engine.types";
import { toLocalDateString } from "@/utilities/helper/time";

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
  const [filterDate, setFilterDate] = useState<string>(
    toLocalDateString(new Date()),
  );

  const filteredEngineInspections = useMemo(() => {
    if (!filterDate) return engineInspections;
    return engineInspections.filter((i) => {
      const inspectedDate = toLocalDateString(new Date(i.inspected_at));
      return inspectedDate === filterDate;
    });
  }, [engineInspections, filterDate]);

  const filteredPowerToolInspections = useMemo(() => {
    if (!filterDate) return powerToolInspections;
    return powerToolInspections.filter((i) => {
      const inspectedDate = toLocalDateString(new Date(i.created_at));
      return inspectedDate === filterDate;
    });
  }, [powerToolInspections, filterDate]);

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

      <Box mb={2} maxWidth={200}>
        <TextField
          type="date"
          label="Filter by Date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: toLocalDateString(new Date()) }}
        />
      </Box>

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
              inspections={filteredEngineInspections}
              engines={engines}
              onFilterChange={onEngineFilterChange}
            />
          )}
          {subTab === 1 && (
            <PowerToolInspectionTable
              inspections={filteredPowerToolInspections}
            />
          )}
        </>
      )}
    </Box>
  );
}
