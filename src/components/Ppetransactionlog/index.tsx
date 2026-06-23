"use client";

import { useEffect, useState } from "react";
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
  Chip,
  Collapse,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  TextField,
  useTheme,
  CircularProgress,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import {
  usePpeTransactions,
  PpeTransactionRow,
  getFirefighterDisplayName,
} from "@/hooks/usePpeTransactions";
import { useAllUsers } from "@/hooks/useUsers";
import {
  PpeItemWithAvailable,
  PpeTransactionType,
} from "@/utilities/types/ppe.types";

interface PpeTransactionLogProps {
  ppeItems: PpeItemWithAvailable[];
  /** Bump this (e.g. a counter) to force a re-fetch of the current page from
   * outside — used so a successful issue/return elsewhere on the page can
   * make the log reflect the new transaction immediately, without the user
   * needing to touch a filter or page control themselves. */
  refreshKey?: number;
}

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

// One option in the combined firefighter filter — wraps either identity
// kind behind a single label, since the log filters by "who" without the
// user needing to know/care whether that person has a Users row.
interface FirefighterOption {
  label: string;
  kind: "registered" | "unregistered";
  userId?: number;
  firefighterName?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TypeChip({ type }: { type: PpeTransactionType }) {
  const isIssue = type === "issue";
  return (
    <Chip
      size="small"
      icon={
        isIssue ? (
          <AssignmentTurnedInOutlinedIcon sx={{ fontSize: "0.9rem" }} />
        ) : (
          <AssignmentReturnOutlinedIcon sx={{ fontSize: "0.9rem" }} />
        )
      }
      label={isIssue ? "Issued" : "Returned"}
      sx={{
        fontWeight: 700,
        fontSize: "0.68rem",
        height: 22,
        bgcolor: isIssue ? "rgba(220,38,38,0.12)" : "rgba(34,197,94,0.12)",
        color: isIssue ? "#dc2626" : "#22c55e",
        border: `1px solid ${isIssue ? "rgba(220,38,38,0.3)" : "rgba(34,197,94,0.3)"}`,
        "& .MuiChip-icon": { color: "inherit" },
      }}
    />
  );
}

function SignatureRow({
  row,
  getSignatureUrl,
}: {
  row: PpeTransactionRow;
  getSignatureUrl: (signaturePath: string) => Promise<string | null>;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSignatureUrl(row.signature_path).then((result) => {
      if (!cancelled) {
        setUrl(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.signature_path]);

  return (
    <Box
      sx={{
        p: 2,
        background: "#fafafa",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography
        sx={{
          color: "#dc2626",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Signature
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
          <CircularProgress size={16} sx={{ color: "#dc2626" }} />
          <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.45)" }}>
            Loading signature…
          </Typography>
        </Box>
      ) : url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Signature for ${getFirefighterDisplayName(row)}`}
          style={{
            maxWidth: 280,
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "#fff",
          }}
        />
      ) : (
        <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.45)" }}>
          Signature unavailable.
        </Typography>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          mt: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#dc2626",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Condition
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.75)" }}>
            {row.condition}
          </Typography>
        </Box>
        <Box>
          <Typography
            sx={{
              color: "#dc2626",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Recorded By
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.75)" }}>
            {row.recorder?.name ?? "Unknown"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function LogRow({
  row,
  getSignatureUrl,
}: {
  row: PpeTransactionRow;
  getSignatureUrl: (signaturePath: string) => Promise<string | null>;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow
        onClick={() => setExpanded((e) => !e)}
        sx={{
          cursor: "pointer",
          "& td": {
            borderBottom: expanded ? "none" : "1px solid rgba(0,0,0,0.06)",
          },
          "&:hover": { background: "rgba(220,38,38,0.04)" },
          transition: "background 0.15s",
        }}
      >
        <TableCell sx={{ py: 1.5 }}>
          <IconButton size="small" sx={{ color: "rgba(0,0,0,0.4)" }}>
            {expanded ? (
              <KeyboardArrowUpIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownIcon fontSize="small" />
            )}
          </IconButton>
        </TableCell>
        <TableCell sx={{ py: 1.5 }}>
          <TypeChip type={row.type} />
        </TableCell>
        <TableCell sx={{ py: 1.5 }}>
          <Typography fontSize="0.85rem" sx={{ color: "text.primary" }}>
            {formatDate(row.occurred_at)}
          </Typography>
        </TableCell>
        <TableCell sx={{ py: 1.5 }}>
          <Typography
            fontWeight={600}
            fontSize="0.85rem"
            sx={{ color: "text.primary" }}
          >
            {getFirefighterDisplayName(row)}
          </Typography>
        </TableCell>
        <TableCell sx={{ py: 1.5 }}>
          <Typography fontSize="0.85rem" sx={{ color: "text.primary" }}>
            {row.ppe_item
              ? `${row.ppe_item.brand} — ${row.ppe_item.category} (${row.ppe_item.size})`
              : "Unknown item"}
          </Typography>
        </TableCell>
        <TableCell align="center" sx={{ py: 1.5 }}>
          <Typography fontWeight={700} fontSize="0.85rem">
            {row.quantity}
          </Typography>
        </TableCell>
        <TableCell align="center" sx={{ py: 1.5 }}>
          <Typography fontWeight={700} fontSize="0.85rem">
            {row.approved_by_name}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={6}
          sx={{
            py: 0,
            borderBottom: expanded ? "1px solid rgba(0,0,0,0.06)" : "none",
          }}
        >
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 1.5 }}>
              <SignatureRow row={row} getSignatureUrl={getSignatureUrl} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function PpeTransactionLog({
  ppeItems,
  refreshKey,
}: PpeTransactionLogProps) {
  const theme = useTheme();

  const {
    transactions,
    totalCount,
    loading,
    fetchPpeTransactions,
    getSignatureUrl,
    fetchKnownFirefighterNames,
  } = usePpeTransactions();
  const { users } = useAllUsers();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [firefighterFilter, setFirefighterFilter] =
    useState<FirefighterOption | null>(null);
  const [itemFilter, setItemFilter] = useState<number | "">("");
  const [typeFilter, setTypeFilter] = useState<PpeTransactionType | "">("");

  // Combined options list for the firefighter filter: registered users +
  // the full distinct set of unregistered names ever logged (not just
  // those on the currently-loaded page of results).
  const [firefighterOptions, setFirefighterOptions] = useState<
    FirefighterOption[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    fetchKnownFirefighterNames().then((unregisteredNames) => {
      if (cancelled) return;

      const registeredOptions: FirefighterOption[] = users.map((u) => ({
        label: u.name ?? `User #${u.id}`,
        kind: "registered",
        userId: u.id,
      }));

      const unregisteredOptions: FirefighterOption[] = unregisteredNames.map(
        (name) => ({
          label: `${name} (unregistered)`,
          kind: "unregistered",
          firefighterName: name,
        }),
      );

      setFirefighterOptions([...registeredOptions, ...unregisteredOptions]);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  useEffect(() => {
    fetchPpeTransactions(
      {
        userId:
          firefighterFilter?.kind === "registered"
            ? firefighterFilter.userId
            : undefined,
        firefighterName:
          firefighterFilter?.kind === "unregistered"
            ? firefighterFilter.firefighterName
            : undefined,
        ppeItemId: itemFilter === "" ? undefined : itemFilter,
        type: typeFilter === "" ? undefined : typeFilter,
      },
      page,
      rowsPerPage,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    firefighterFilter,
    itemFilter,
    typeFilter,
    page,
    rowsPerPage,
    refreshKey,
  ]);

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      color: "rgba(0,0,0,0.87)",
      bgcolor: "#fff",
      borderRadius: 1.5,
      fontSize: "0.825rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      "& fieldset": { borderColor: "rgba(0,0,0,0.23)" },
      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.45)" },
      "&.Mui-focused fieldset": { borderColor: theme.palette.secondary.main },
    },
    "& .MuiInputLabel-root": { color: "rgba(0,0,0,0.6)" },
    "& .MuiSvgIcon-root": { color: "rgba(0,0,0,0.4)" },
  };

  return (
    <Box>
      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Autocomplete
          options={firefighterOptions}
          value={firefighterFilter}
          onChange={(_, next) => {
            setFirefighterFilter(next);
            setPage(0);
          }}
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) =>
            a.kind === b.kind &&
            a.userId === b.userId &&
            a.firefighterName === b.firefighterName
          }
          renderInput={(params) => (
            <TextField {...params} label="Firefighter" sx={fieldSx} />
          )}
          sx={{ flex: 1.5, minWidth: 200 }}
        />

        <FormControl sx={{ ...fieldSx, flex: 1, minWidth: 180 }}>
          <InputLabel>Item</InputLabel>
          <Select
            label="Item"
            value={itemFilter}
            onChange={(e) => {
              setItemFilter(e.target.value as number | "");
              setPage(0);
            }}
          >
            <MenuItem value="">All Items</MenuItem>
            {ppeItems
              .filter(
                (item): item is PpeItemWithAvailable & { id: number } =>
                  item.id != null,
              )
              .map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.brand} — {item.model} ({item.size})
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl sx={{ ...fieldSx, flex: 1, minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as PpeTransactionType | "");
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="issue">Issued</MenuItem>
            <MenuItem value="return">Returned</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Box
        sx={{
          border: "1px solid rgba(220,38,38,0.20)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={28} sx={{ color: "#dc2626" }} />
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...HEAD_CELL_SX, width: 48 }} />
                  <TableCell sx={HEAD_CELL_SX}>Type</TableCell>
                  <TableCell sx={HEAD_CELL_SX}>Date</TableCell>
                  <TableCell sx={HEAD_CELL_SX}>Firefighter</TableCell>
                  <TableCell sx={HEAD_CELL_SX}>Item</TableCell>
                  <TableCell sx={{ ...HEAD_CELL_SX, textAlign: "center" }}>
                    Qty
                  </TableCell>
                  <TableCell sx={{ ...HEAD_CELL_SX, textAlign: "center" }}>
                    Approved By:
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{
                        textAlign: "center",
                        py: 6,
                        color: "#475569",
                        borderBottom: "none",
                      }}
                    >
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((row) => (
                    <LogRow
                      key={row.id}
                      row={row}
                      getSignatureUrl={getSignatureUrl}
                    />
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
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          sx={PAGINATION_SX}
        />
      </Box>
    </Box>
  );
}
