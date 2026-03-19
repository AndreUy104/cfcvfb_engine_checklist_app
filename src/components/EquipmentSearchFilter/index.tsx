import { useState, useCallback } from "react";
import {
  InputAdornment,
  TextField,
  IconButton,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTheme } from "@mui/material/styles";
import { Equipment } from "@/utilities/types/equipment.types";

interface EquipmentSearchFilterProps {
  equipments: Equipment[];
  value?: string;
  onQueryChange?: (query: string) => void;
  showResultCount?: boolean;
  variant?: "modal" | "page";
}

export function useEquipmentSearch(equipments: Equipment[]) {
  const [query, setQuery] = useState("");

  const filteredEquipments = equipments.filter((eq) => {
    if (!query.trim()) return true;
    const lower = query.toLowerCase();
    return (
      eq.name?.toLowerCase().includes(lower) || String(eq.id).includes(lower)
    );
  });

  const clear = useCallback(() => setQuery(""), []);

  return { query, setQuery, filteredEquipments, clear };
}

export default function EquipmentSearchFilter({
  equipments,
  value,
  onQueryChange,
  showResultCount = true,
  variant = "modal",
}: EquipmentSearchFilterProps) {
  const theme = useTheme();
  const isPage = variant === "page";

  // Internal state used only in uncontrolled mode
  const [internalQuery, setInternalQuery] = useState("");

  const isControlled = value !== undefined;
  const query = isControlled ? value : internalQuery;

  const handleChange = (next: string) => {
    if (isControlled) {
      onQueryChange?.(next);
    } else {
      setInternalQuery(next);
    }
  };

  const handleClear = () => handleChange("");

  const isFiltered = query.trim().length > 0;

  const visibleCount = isFiltered
    ? equipments.filter((eq) => {
        const lower = query.toLowerCase().trim();
        return (
          eq.name?.toLowerCase().includes(lower) ||
          String(eq.id).includes(lower)
        );
      }).length
    : equipments.length;

  // ---------------------------------------------------------------------------
  // Variant-aware style tokens
  // ---------------------------------------------------------------------------

  const iconColor = isFiltered
    ? theme.palette.secondary.main
    : isPage
      ? "rgba(0,0,0,0.4)"
      : "rgba(255,255,255,0.3)";

  const inputSx = isPage
    ? {
        "& .MuiOutlinedInput-root": {
          color: "rgba(0,0,0,0.87)",
          bgcolor: "#fff",
          borderRadius: 1.5,
          fontSize: "0.875rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          "& fieldset": {
            borderColor: isFiltered
              ? theme.palette.secondary.main
              : "rgba(0,0,0,0.23)",
            transition: "border-color 0.2s",
          },
          "&:hover fieldset": {
            borderColor: isFiltered
              ? theme.palette.secondary.main
              : "rgba(0,0,0,0.45)",
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.secondary.main,
          },
        },
        "& .MuiInputBase-input::placeholder": {
          color: "rgba(0,0,0,0.38)",
          fontSize: "0.875rem",
        },
      }
    : {
        "& .MuiOutlinedInput-root": {
          color: "#e8e8e8",
          bgcolor: "rgba(255,255,255,0.04)",
          borderRadius: 1.5,
          fontSize: "0.825rem",
          "& fieldset": {
            borderColor: isFiltered
              ? `${theme.palette.secondary.main}50`
              : "rgba(255,255,255,0.1)",
            transition: "border-color 0.2s",
          },
          "&:hover fieldset": {
            borderColor: isFiltered
              ? `${theme.palette.secondary.main}80`
              : "rgba(255,255,255,0.22)",
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.secondary.main,
          },
        },
        "& .MuiInputBase-input::placeholder": {
          color: "rgba(255,255,255,0.25)",
          fontSize: "0.8rem",
        },
      };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <TextField
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search equipment by name…"
        size="small"
        fullWidth
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FilterListIcon
                sx={{
                  fontSize: isPage ? "1.1rem" : "1rem",
                  color: iconColor,
                  transition: "color 0.2s",
                }}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isFiltered ? (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                  sx={{
                    color: isPage
                      ? "rgba(0,0,0,0.45)"
                      : "rgba(255,255,255,0.4)",
                    p: 0.4,
                    "&:hover": { color: isPage ? "rgba(0,0,0,0.87)" : "#fff" },
                  }}
                >
                  <ClearIcon sx={{ fontSize: "0.9rem" }} />
                </IconButton>
              ) : (
                <SearchIcon
                  sx={{
                    fontSize: "0.95rem",
                    color: isPage
                      ? "rgba(0,0,0,0.35)"
                      : "rgba(255,255,255,0.2)",
                  }}
                />
              )}
            </InputAdornment>
          ),
        }}
        sx={inputSx}
      />

      {/* Result-count badge – only visible when a query is active */}
      {showResultCount && isFiltered && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={
              visibleCount === 0
                ? "No matches"
                : `${visibleCount} of ${equipments.length} shown`
            }
            size="small"
            sx={{
              bgcolor:
                visibleCount === 0
                  ? "rgba(244,67,54,0.12)"
                  : `${theme.palette.secondary.main}15`,
              color:
                visibleCount === 0 ? "#f44336" : theme.palette.secondary.main,
              border: `1px solid ${
                visibleCount === 0
                  ? "rgba(244,67,54,0.3)"
                  : `${theme.palette.secondary.main}35`
              }`,
              fontWeight: 600,
              fontSize: "0.68rem",
              height: 20,
            }}
          />
          {visibleCount === 0 && (
            <Typography
              variant="caption"
              sx={{
                color: isPage ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.3)",
                fontSize: "0.72rem",
              }}
            >
              Try a different term
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
