"use client";

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Equipment, EquipmentColumn } from  "@/utilities/types/equipment.types";

interface EquipmentTableProps {
  columns: EquipmentColumn[];
  rows: Equipment[];
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}


const HEAD_CELL_SX = {
  color: "#dc2626",
  fontWeight: 700,
  fontSize: "0.7rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  borderBottom: "1px solid rgba(220,38,38,0.25)",
  background: "rgba(0,0,0,0.3)",
  py: 1.5,
};

const PAGINATION_SX = {
  borderTop: "1px solid rgba(255,255,255,0.05)",
  color: "#dc2626",
  fontSize: "0.8rem",
  "& .MuiTablePagination-selectIcon": { color: "#dc2626" },
  "& .MuiIconButton-root": { color: "#dc2626" },
  "& .MuiIconButton-root.Mui-disabled": { color: "#374151" },
  "& .MuiTablePagination-toolbar": {
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 0.5,
    px: { xs: 1, sm: 2 },
  },
};

function MobileCard({
  row,
  columns,
}: {
  row: Equipment;
  columns: EquipmentColumn[];
}) {
  const dataColumns = columns.filter((c) => c.key !== "actions");
  const actionsColumn = columns.find((c) => c.key === "actions");

  return (
    <Box
      sx={{
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 2,
        p: 2,
        mb: 1.5,
        background: "rgba(0,0,0,0.25)",
        "&:last-of-type": { mb: 0 },
        transition: "background 0.15s",
        "&:active": { background: "rgba(220,38,38,0.06)" },
      }}
    >
      {/* Top row: name + actions */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box flex={1} mr={1}>
          {dataColumns
            .filter((c) => c.key === "name")
            .map((col) => (
              <Box key={col.key}>
                {col.renderCell ? col.renderCell(row) : String(row[col.key as keyof Equipment] ?? "")}
              </Box>
            ))}
        </Box>
        {actionsColumn?.renderCell && (
          <Box sx={{ flexShrink: 0 }}>{actionsColumn.renderCell(row)}</Box>
        )}
      </Box>

      {/* Remaining data fields as label/value rows */}
      <Box
        display="grid"
        gridTemplateColumns="1fr 1fr"
        gap={1.25}
      >
        {dataColumns
          .filter((c) => c.key !== "name")
          .map((col) => (
            <Box key={col.key}>
              <Typography
                sx={{
                  color: "#dc2626",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  mb: 0.4,
                }}
              >
                {col.label}
              </Typography>
              <Box>
                {col.renderCell
                  ? col.renderCell(row)
                  : String(row[col.key as keyof Equipment] ?? "")}
              </Box>
            </Box>
          ))}
      </Box>
    </Box>
  );
}


export default function EquipmentTable({
  columns,
  rows,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}: EquipmentTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const emptyState = (colSpan: number) => (
    <Box
      sx={{
        textAlign: "center",
        py: 6,
        color: "#475569",
        fontSize: "0.875rem",
      }}
    >
      No equipment found.
    </Box>
  );

  return (
    <Box
      sx={{
        border: "1px solid rgba(220,38,38,0.20)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {isMobile ? (
        <Box sx={{ p: 1.5 }}>
          {rows.length === 0
            ? emptyState(columns.length)
            : rows.map((row) => (
                <MobileCard key={row.id} row={row} columns={columns} />
              ))}
        </Box>
      ) : (
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{ ...HEAD_CELL_SX, textAlign: col.align ?? "left" }}
                  >
                    {col.label}
                    {col.labelSuffix}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    sx={{
                      textAlign: "center",
                      py: 6,
                      color: "#475569",
                      borderBottom: "none",
                    }}
                  >
                    No equipment found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td": { borderBottom: "none" },
                      "& td": { borderBottom: "1px solid rgba(255,255,255,0.05)" },
                      "&:hover": { background: "rgba(220,38,38,0.05)" },
                      transition: "background 0.15s",
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{ py: 2, textAlign: col.align ?? "left" }}
                      >
                        {col.renderCell
                          ? col.renderCell(row)
                          : col.key !== "actions"
                          ? String(row[col.key as keyof Equipment] ?? "")
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) =>
          onRowsPerPageChange(parseInt(e.target.value, 10))
        }
        rowsPerPageOptions={[5, 10, 25]}
        sx={PAGINATION_SX}
      />
    </Box>
  );
}