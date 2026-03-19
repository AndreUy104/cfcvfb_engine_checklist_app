import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTheme } from "@mui/material/styles";
import { Equipment } from "@/utilities/types/equipment.types";
import { useEquipment } from "@/hooks/useEquipment";

interface DeleteEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  target: Equipment | null;
}

export default function DeleteEquipmentModal({
  isOpen,
  onClose,
  onSuccess,
  target,
}: DeleteEquipmentModalProps) {
  const theme = useTheme();
  const { deleteEquipment, loading, error } = useEquipment();

  async function handleConfirm() {
    if (!target) return;
    const success = await deleteEquipment(target.id);
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
          border: "1px solid rgba(220,38,38,0.30)",
          borderRadius: 2,
          boxShadow:
            "0 0 60px rgba(220,38,38,0.15), 0 20px 60px rgba(0,0,0,0.6)",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid rgba(220,38,38,0.15)",
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
          Delete Equipment
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(220,38,38,0.12)",
              border: "1px solid rgba(220,38,38,0.30)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningAmberIcon sx={{ color: "#dc2626", fontSize: 28 }} />
          </Box>

          <Box textAlign="center">
            <Typography
              variant="body1"
              fontWeight={600}
              sx={{ color: "rgba(255,255,255,0.85)", mb: 0.5 }}
            >
              Are you sure you want to delete
            </Typography>
            <Typography
              variant="body1"
              fontWeight={700}
              sx={{ color: "#dc2626" }}
            >
              {target?.name}?
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.4)", mt: 1 }}
            >
              This action cannot be undone.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

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
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={<DeleteOutlineIcon />}
          disabled={loading}
          sx={{
            fontWeight: 700,
            letterSpacing: "0.06em",
            background: "#dc2626",
            "&:hover": { background: "#b91c1c" },
            "&:disabled": { background: "rgba(220,38,38,0.3)" },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
