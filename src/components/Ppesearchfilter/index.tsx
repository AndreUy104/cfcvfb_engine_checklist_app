"use client";

import { useState, useCallback } from "react";
import {
  InputAdornment,
  TextField,
  IconButton,
  Box,
  Chip,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTheme } from "@mui/material/styles";
import {
  PpeItemWithAvailable,
  PpeCategory,
  PPE_CATEGORIES,
} from "@/utilities/types/ppe.types";

interface PpeSearchFilterProps {
  ppeItems: PpeItemWithAvailable[];
  value?: string;
  onQueryChange?: (query: string) => void;
  category?: PpeCategory | "all";
  onCategoryChange?: (category: PpeCategory | "all") => void;
  showResultCount?: boolean;
  variant?: "modal" | "page";
}

function matchesQuery(item: PpeItemWithAvailable, query: string) {
  if (!query.trim()) return true;
  const lower = query.toLowerCase();
  return (
    item.brand?.toLowerCase().includes(lower) ||
    item.model?.toLowerCase().includes(lower)
  );
}

function matchesCategory(
  item: PpeItemWithAvailable,
  category: PpeCategory | "all",
) {
  if (category === "all") return true;
  return item.category === category;
}

export function usePpeSearch(ppeItems: PpeItemWithAvailable[]) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PpeCategory | "all">("all");

  const filteredPpeItems = ppeItems.filter(
    (item) => matchesQuery(item, query) && matchesCategory(item, category),
  );

  const clear = useCallback(() => {
    setQuery("");
    setCategory("all");
  }, []);

  return {
    query,
    setQuery,
    category,
    setCategory,
    filteredPpeItems,
    clear,
  };
}

export default function PpeSearchFilter({
  ppeItems,
  value,
  onQueryChange,
  category,
  onCategoryChange,
  showResultCount = true,
  variant = "modal",
}: PpeSearchFilterProps) {
  const theme = useTheme();
  const isPage = variant === "page";

  // Internal state used only in uncontrolled mode
  const [internalQuery, setInternalQuery] = useState("");
  const [internalCategory, setInternalCategory] = useState<PpeCategory | "all">(
    "all",
  );

  const isQueryControlled = value !== undefined;
  const query = isQueryControlled ? value : internalQuery;

  const isCategoryControlled = category !== undefined;
  const activeCategory = isCategoryControlled ? category : internalCategory;

  const handleQueryChange = (next: string) => {
    if (isQueryControlled) {
      onQueryChange?.(next);
    } else {
      setInternalQuery(next);
    }
  };

  const handleCategoryChange = (next: PpeCategory | "all") => {
    if (isCategoryControlled) {
      onCategoryChange?.(next);
    } else {
      setInternalCategory(next);
    }
  };

  const handleClear = () => handleQueryChange("");

  const isFiltered = query.trim().length > 0 || activeCategory !== "all";

  const visibleCount = ppeItems.filter(
    (item) =>
      matchesQuery(item, query) && matchesCategory(item, activeCategory),
  ).length;

  // ---------------------------------------------------------------------------
  // Variant-aware style tokens (matches EquipmentSearchFilter exactly)
  // ---------------------------------------------------------------------------

  const isQueryActive = query.trim().length > 0;

  const iconColor = isQueryActive
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
            borderColor: isQueryActive
              ? theme.palette.secondary.main
              : "rgba(0,0,0,0.23)",
            transition: "border-color 0.2s",
          },
          "&:hover fieldset": {
            borderColor: isQueryActive
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
            borderColor: isQueryActive
              ? `${theme.palette.secondary.main}50`
              : "rgba(255,255,255,0.1)",
            transition: "border-color 0.2s",
          },
          "&:hover fieldset": {
            borderColor: isQueryActive
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

  const selectSx = isPage
    ? {
        bgcolor: "#fff",
        borderRadius: 1.5,
        fontSize: "0.875rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor:
            activeCategory !== "all"
              ? theme.palette.secondary.main
              : "rgba(0,0,0,0.23)",
        },
      }
    : {
        bgcolor: "rgba(255,255,255,0.04)",
        color: "#e8e8e8",
        borderRadius: 1.5,
        fontSize: "0.825rem",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor:
            activeCategory !== "all"
              ? `${theme.palette.secondary.main}80`
              : "rgba(255,255,255,0.1)",
        },
        "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.4)" },
      };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search by brand or model…"
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
                {isQueryActive ? (
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    edge="end"
                    sx={{
                      color: isPage
                        ? "rgba(0,0,0,0.45)"
                        : "rgba(255,255,255,0.4)",
                      p: 0.4,
                      "&:hover": {
                        color: isPage ? "rgba(0,0,0,0.87)" : "#fff",
                      },
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
          sx={{ ...inputSx, flex: 2 }}
        />

        <FormControl size="small" sx={{ flex: 1, minWidth: 160 }}>
          <Select
            value={activeCategory}
            onChange={(e) =>
              handleCategoryChange(e.target.value as PpeCategory | "all")
            }
            displayEmpty
            sx={selectSx}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {PPE_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Result-count badge – only visible when a filter is active */}
      {showResultCount && isFiltered && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={
              visibleCount === 0
                ? "No matches"
                : `${visibleCount} of ${ppeItems.length} shown`
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
              Try a different search or category
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
