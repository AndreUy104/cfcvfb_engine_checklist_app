"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Box,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import MergeIcon from "@mui/icons-material/CallMerge";
import { useTheme } from "@mui/material/styles";
import {
  PpeItemWithAvailable,
  PpeFormData,
  PpeCategory,
  PPE_CATEGORIES,
} from "@/utilities/types/ppe.types";
import { usePpe } from "@/hooks/usePpe";

interface AddNewPpeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** When provided the modal switches to edit mode and pre-fills the form */
  editTarget?: PpeItemWithAvailable | null;
}

const DEFAULT_FORM: PpeFormData = {
  category: "",
  brand: "",
  model: "",
  size: "",
  total: "",
};

function ppeItemToForm(item: PpeItemWithAvailable): PpeFormData {
  return {
    category: item.category ?? "",
    brand: item.brand ?? "",
    model: item.model ?? "",
    size: item.size ?? "",
    total: item.total != null ? String(item.total) : "",
  };
}

export default function AddNewPpeModal({
  isOpen,
  onClose,
  onSuccess,
  editTarget,
}: AddNewPpeModalProps) {
  const theme = useTheme();
  const { createPpeItem, updatePpeItem, findExistingCombo, loading, error } =
    usePpe();
  const [form, setForm] = useState<PpeFormData>(() =>
    editTarget ? ppeItemToForm(editTarget) : DEFAULT_FORM,
  );

  // Set when Add mode detects an existing Brand+Model+Category+Size combo.
  // Presence of this drives the merge-confirm UI instead of the normal form.
  const [mergeTarget, setMergeTarget] = useState<PpeItemWithAvailable | null>(
    null,
  );

  const isEditMode = Boolean(editTarget);
  const isMergeMode = Boolean(mergeTarget);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Editing any field after a merge prompt was shown invalidates the
    // detected duplicate — re-check on next submit rather than leaving a
    // stale merge target around.
    if (mergeTarget) setMergeTarget(null);
  }

  function handleCategoryChange(value: PpeCategory) {
    setForm((prev) => ({ ...prev, category: value }));
    if (mergeTarget) setMergeTarget(null);
  }

  async function handleSubmit() {
    const totalValue = form.total === "" ? 0 : Number(form.total);

    if (isEditMode && editTarget) {
      // editTarget.id is typed number | null because PpeItemWithAvailable
      // comes from a Postgres VIEW — PostgREST can't express "this column
      // is actually NOT NULL" for view output, even though it always is in
      // practice (it's PpeItems.id, an identity column). Guard explicitly
      // rather than asserting/casting past it.
      if (editTarget.id == null) {
        // Shouldn't happen in practice — surface it rather than fail silently.
        console.error("AddNewPpeModal: editTarget has no id, cannot update");
        return;
      }

      const success = await updatePpeItem(editTarget.id, {
        category: form.category || undefined,
        brand: form.brand,
        model: form.model,
        size: form.size,
        total: totalValue,
      });
      if (success) {
        onSuccess?.();
        handleClose();
      }
      return;
    }

    // Add mode: check for an existing combo before attempting an insert.
    if (!isMergeMode) {
      const existing = findExistingCombo(
        form.brand,
        form.model,
        form.category,
        form.size,
      );
      if (existing) {
        setMergeTarget(existing);
        return;
      }

      const success = await createPpeItem({
        category: form.category as PpeCategory,
        brand: form.brand,
        model: form.model,
        size: form.size,
        total: totalValue,
      });
      if (success) {
        onSuccess?.();
        handleClose();
      }
      return;
    }

    // Merge mode: the "Total" field is being used as "quantity to add" —
    // increment the existing item's total rather than creating a new row.
    if (mergeTarget) {
      if (mergeTarget.id == null) {
        console.error("AddNewPpeModal: mergeTarget has no id, cannot merge");
        return;
      }

      const additionalQty = form.total === "" ? 0 : Number(form.total);
      const success = await updatePpeItem(mergeTarget.id, {
        total: (mergeTarget.total ?? 0) + additionalQty,
      });
      if (success) {
        onSuccess?.();
        handleClose();
      }
    }
  }

  function handleClose() {
    setForm(DEFAULT_FORM);
    setMergeTarget(null);
    onClose();
  }

  const fieldSx = {
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.5)",
      fontWeight: 600,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.secondary.main,
    },
    "& .MuiOutlinedInput-root": {
      color: "#e8e8e8",
      bgcolor: "rgba(255,255,255,0.04)",
      borderRadius: 1.5,
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
      "&.Mui-focused fieldset": { borderColor: theme.palette.secondary.main },
    },
  };

  const canSubmitForm =
    form.category !== "" &&
    form.brand.trim() &&
    form.model.trim() &&
    form.size.trim();

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.primary.main,
          border: `1px solid ${theme.palette.secondary.main}30`,
          borderRadius: 2,
          boxShadow: `0 0 60px ${theme.palette.secondary.main}20, 0 20px 60px rgba(0,0,0,0.6)`,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: `${theme.palette.primary.main}cc`,
          borderBottom: `1px solid ${theme.palette.secondary.main}25`,
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#f0f0f0",
            }}
          >
            {isMergeMode
              ? "Item Already Exists"
              : isEditMode
                ? "Edit PPE Item"
                : "Add New PPE Item"}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            {isMergeMode
              ? "Add to existing stock instead of creating a duplicate"
              : isEditMode
                ? `Editing: ${editTarget?.brand} — ${editTarget?.model}`
                : "Register a new PPE item to the inventory"}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        {isMergeMode && mergeTarget ? (
          <>
            <Alert severity="info" icon={<MergeIcon fontSize="small" />}>
              <strong>
                {mergeTarget.brand} — {mergeTarget.model} ({mergeTarget.size})
              </strong>{" "}
              already exists in {mergeTarget.category} with{" "}
              <strong>{mergeTarget.total}</strong> total units (
              {mergeTarget.available} currently available).
            </Alert>

            <TextField
              label="Quantity to Add"
              name="total"
              type="number"
              placeholder="e.g., 5"
              value={form.total}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              inputProps={{ min: 1 }}
              helperText={
                form.total !== ""
                  ? `New total will be ${
                      (mergeTarget.total ?? 0) + Number(form.total)
                    }`
                  : undefined
              }
              FormHelperTextProps={{
                sx: { color: "rgba(255,255,255,0.4)" },
              }}
              sx={fieldSx}
            />
          </>
        ) : (
          <>
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={form.category}
                onChange={(e) =>
                  handleCategoryChange(e.target.value as PpeCategory)
                }
              >
                {PPE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Brand"
              name="brand"
              placeholder="e.g., Bullard"
              value={form.brand}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={fieldSx}
            />

            <TextField
              label="Model"
              name="model"
              placeholder="e.g., LTX"
              value={form.model}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={fieldSx}
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                label="Size"
                name="size"
                placeholder="e.g., One Size"
                value={form.size}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={fieldSx}
              />
              <TextField
                label="Total Quantity"
                name="total"
                type="number"
                placeholder="e.g., 10"
                value={form.total}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                inputProps={{ min: 0 }}
                sx={fieldSx}
              />
            </Box>
          </>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: `${theme.palette.secondary.main}20` }} />

      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button
          onClick={isMergeMode ? () => setMergeTarget(null) : handleClose}
          variant="outlined"
          sx={{
            color: "rgba(255,255,255,0.5)",
            borderColor: "rgba(255,255,255,0.15)",
            "&:hover": {
              borderColor: "rgba(255,255,255,0.35)",
              color: "rgba(255,255,255,0.85)",
            },
          }}
        >
          {isMergeMode ? "Back" : "Cancel"}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          startIcon={
            isMergeMode ? (
              <MergeIcon />
            ) : isEditMode ? (
              <SaveOutlinedIcon />
            ) : (
              <AddIcon />
            )
          }
          disabled={
            loading ||
            (isMergeMode
              ? !form.total || Number(form.total) <= 0
              : !canSubmitForm)
          }
          sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
        >
          {isMergeMode
            ? "Add to Existing Stock"
            : isEditMode
              ? "Save Changes"
              : "Add PPE Item"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
