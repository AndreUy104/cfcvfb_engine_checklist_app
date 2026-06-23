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
import { PpeItemWithAvailable, PpeColumn } from "@/utilities/types/ppe.types";

interface PpeTableProps {
  columns: PpeColumn[];
  rows: PpeItemWithAvailable[];
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

// Light-page palette: subtle red-tinted header band (not flat grey), dark
// borders/text appropriate for a white page background.
const HEAD_CELL_SX = {
  color: "#dc2626",
  fontWeight: 700,
  fontSize: "0.7rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  borderBottom: "1px solid rgba(220,38,38,0.25)",
  background: "rgba(220,38,38,0.06)",
  py: 1.5,
};

const PAGINATION_SX = {
  borderTop: "1px solid rgba(0,0,0,0.08)",
  color: "#dc2626",
  fontSize: "0.8rem",
  "& .MuiTablePagination-selectIcon": { color: "#dc2626" },
  "& .MuiIconButton-root": { color: "#dc2626" },
  "& .MuiIconButton-root.Mui-disabled": { color: "rgba(0,0,0,0.25)" },
  "& .MuiTablePagination-toolbar": {
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 0.5,
    px: { xs: 1, sm: 2 },
  },
};

function PpeTitle({ row }: { row: PpeItemWithAvailable }) {
  return (
    <Typography
      fontWeight={700}
      fontSize="0.88rem"
      letterSpacing="0.02em"
      sx={{ color: "text.primary" }}
    >
      {row.brand} — {row.model} ({row.size})
    </Typography>
  );
}

function MobileCard({
  row,
  columns,
}: {
  row: PpeItemWithAvailable;
  columns: PpeColumn[];
}) {
  // Brand/Model/Size are folded into one title row (no single "name" field
  // on PpeItems, unlike Equipment), so they're excluded from the grid below
  // to avoid showing them twice.
  const dataColumns = columns.filter(
    (c) => !["brand", "model", "size", "actions"].includes(c.key as string),
  );
  const actionsColumn = columns.find((c) => c.key === "actions");

  return (
    <Box
      sx={{
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 2,
        p: 2,
        mb: 1.5,
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        "&:last-of-type": { mb: 0 },
        transition: "background 0.15s",
        "&:active": { background: "rgba(220,38,38,0.04)" },
      }}
    >
      {/* Top row: Brand — Model (Size) + actions */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={1.5}
      >
        <Box flex={1} mr={1}>
          <PpeTitle row={row} />
        </Box>
        {actionsColumn?.renderCell && (
          <Box sx={{ flexShrink: 0 }}>{actionsColumn.renderCell(row)}</Box>
        )}
      </Box>

      {/* Remaining data fields as label/value rows */}
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.25}>
        {dataColumns.map((col) => (
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
                : String(row[col.key as keyof PpeItemWithAvailable] ?? "")}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function PpeTable({
  columns,
  rows,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}: PpeTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        border: "1px solid rgba(220,38,38,0.20)",
        borderRadius: 2,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {isMobile ? (
        <Box sx={{ p: 1.5, background: "#fafafa" }}>
          {rows.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: "rgba(0,0,0,0.4)",
                fontSize: "0.875rem",
              }}
            >
              No PPE items found.
            </Box>
          ) : (
            rows.map((row) => (
              <MobileCard key={row.id} row={row} columns={columns} />
            ))
          )}
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
                      color: "rgba(0,0,0,0.4)",
                      borderBottom: "none",
                    }}
                  >
                    No PPE items found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td": { borderBottom: "none" },
                      "& td": {
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                      },
                      "&:hover": { background: "rgba(220,38,38,0.04)" },
                      transition: "background 0.15s",
                      // Low-stock rows get a subtle persistent highlight,
                      // distinct from the hover state above.
                      ...(row.is_low_stock && {
                        background: "rgba(234,179,8,0.08)",
                      }),
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
                            ? String(
                                row[col.key as keyof PpeItemWithAvailable] ??
                                  "",
                              )
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
