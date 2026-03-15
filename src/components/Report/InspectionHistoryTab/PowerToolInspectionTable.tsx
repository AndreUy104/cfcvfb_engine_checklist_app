import { useState } from "react";
import {
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
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { PowerToolInspectionWithDetails } from "@/utilities/types/inspection.types";
import InspectionDetailModal from "./InspectionDetailModal";

interface PowerToolInspectionTableProps {
  inspections: PowerToolInspectionWithDetails[];
}

export default function PowerToolInspectionTable({
  inspections,
}: PowerToolInspectionTableProps) {
  const [selected, setSelected] =
    useState<PowerToolInspectionWithDetails | null>(null);

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight={700}>Tool</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>Inspected By</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>Date & Time</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>Running</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>Condition</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={700}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inspections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No power tool inspections found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              inspections.map((inspection) => (
                <TableRow key={inspection.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {inspection.Equipments?.name ?? "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>{inspection.Users?.name ?? "—"}</TableCell>
                  <TableCell>
                    {new Date(inspection.created_at).toLocaleDateString(
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
                      label={inspection.is_running ? "Yes" : "No"}
                      size="small"
                      color={inspection.is_running ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inspection.physical_condition ?? "—"}
                      size="small"
                      color={
                        inspection.physical_condition === "Good"
                          ? "success"
                          : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => setSelected(inspection)}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <InspectionDetailModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        inspection={selected}
        type="powerTool"
      />
    </>
  );
}
