import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  TextField,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { InspectionWithDetails } from "@/utilities/types/inspection.types";
import { EngineWithType } from "@/utilities/types/engine.types";
import InspectionDetailModal from "./InspectionDetailModal";

interface EngineInspectionTableProps {
  inspections: InspectionWithDetails[];
  engines: EngineWithType[];
  onFilterChange: (engineId?: number) => void;
}

function getOverallStatus(inspection: InspectionWithDetails): {
  label: string;
  color: "success" | "error";
} {
  const hasFaulty = [
    inspection.battery_status,
    inspection.lights_and_siren,
    inspection.radio_status,
  ].some((c) => c === "Faulty" || c === "Dead" || c === "Weak");

  const hasDown = inspection.Inspection_Equipment_Results.some(
    (r) => r.status === false,
  );

  return hasFaulty || hasDown
    ? { label: "Issues Found", color: "error" }
    : { label: "All Good", color: "success" };
}

export default function EngineInspectionTable({
  inspections,
  engines,
  onFilterChange,
}: EngineInspectionTableProps) {
  const [selectedInspection, setSelectedInspection] =
    useState<InspectionWithDetails | null>(null);
  const [filterEngine, setFilterEngine] = useState<number | "">("");

  function handleFilterChange(value: number | "") {
    setFilterEngine(value);
    onFilterChange(value === "" ? undefined : value);
  }

  return (
    <>
      <Box mb={2} maxWidth={280}>
        <TextField
          select
          label="Filter by Engine"
          value={filterEngine}
          onChange={(e) =>
            handleFilterChange(
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
          fullWidth
          size="small"
        >
          <MenuItem value="">All Engines</MenuItem>
          {engines.map((e) => (
            <MenuItem key={e.id} value={e.id}>
              {e.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight={700}>Engine</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>Inspected By</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>Date & Time</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>Overall Status</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={700}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inspections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No engine inspections found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              inspections.map((inspection) => {
                const status = getOverallStatus(inspection);
                return (
                  <TableRow key={inspection.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {inspection.Engines?.name ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>{inspection.Users?.name ?? "—"}</TableCell>
                    <TableCell>
                      {new Date(inspection.inspected_at).toLocaleDateString(
                        "en-PH",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        size="small"
                        color={status.color}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedInspection(inspection)}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <InspectionDetailModal
        isOpen={Boolean(selectedInspection)}
        onClose={() => setSelectedInspection(null)}
        inspection={selectedInspection}
        type="engine"
      />
    </>
  );
}
