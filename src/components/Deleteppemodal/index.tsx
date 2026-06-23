"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTheme } from "@mui/material/styles";
import { PpeItemWithAvailable } from "@/utilities/types/ppe.types";
import { usePpe } from "@/hooks/usePpe";

interface DeletePpeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  target: PpeItemWithAvailable | null;
}

export default function DeletePpeModal({
  isOpen,
  onClose,
  onSuccess,
  target,
}: DeletePpeModalProps) {
  const theme = useTheme();
  const { deletePpeItem, loading, error } = usePpe();

  const hasIssuedUnits = (target?.issued ?? 0) > 0;

  async function handleConfirm() {
    if (!target || hasIssuedUnits) return;
    if (target.id == null) {
      console.error("DeletePpeModal: target has no id, cannot delete");
      return;
    }
    const success = await deletePpeItem(target.id);
    if (success) {
      onSuccess?.();
      onClose();
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
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
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#f0f0f0",
          }}
        >
          Delete PPE Item
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
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
          gap: 2,
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        {target && (
          <>
            {hasIssuedUnits ? (
              <Alert
                severity="warning"
                icon={<WarningAmberIcon fontSize="small" />}
              >
                Can&apos;t delete{" "}
                <strong>
                  {target.brand} — {target.model} ({target.size})
                </strong>
                : {target.issued} unit{target.issued === 1 ? "" : "s"} still
                issued to firefighters. All units must be returned before this
                item can be deleted.
              </Alert>
            ) : (
              <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>
                Are you sure you want to delete{" "}
                <strong>
                  {target.brand} — {target.model} ({target.size})
                </strong>{" "}
                from {target.category} inventory? This cannot be undone.
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: `${theme.palette.secondary.main}20` }} />

      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
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
          {hasIssuedUnits ? "Close" : "Cancel"}
        </Button>
        {!hasIssuedUnits && (
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            disabled={loading || !target}
            sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
          >
            Delete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
