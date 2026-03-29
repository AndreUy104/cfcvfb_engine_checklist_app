import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { MailOutline } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useInviteUser } from "@/hooks/useUsers";
import { useAllPositions } from "@/hooks/useUsers";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteUserModal({
  open,
  onClose,
  onSuccess,
}: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [positionId, setPositionId] = useState<number | "">("");

  const { positions, loading: positionsLoading } = useAllPositions();
  const { inviting, inviteError, inviteSuccess, sendInvite, resetInviteState } =
    useInviteUser();

  const handleClose = () => {
    setEmail("");
    setPositionId("");
    resetInviteState();
    onClose();
  };

  const handleInvite = async () => {
    if (!email || positionId === "") return;
    await sendInvite({ email, position_id: positionId as number });
  };

  const selectedPosition = positions.find((p) => p.id === positionId);

  useEffect(() => {
    if (inviteSuccess) {
      const t = setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [inviteSuccess]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MailOutline color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Invite New User
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        <Typography variant="body2" color="text.secondary">
          An invitation email will be sent via Supabase Auth. The user will set
          their password on first login.
        </Typography>

        <TextField
          label="Email Address"
          type="email"
          fullWidth
          size="small"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          disabled={inviting}
        />

        {/* Position selector — driven by real Positions table */}
        <FormControl
          size="small"
          fullWidth
          disabled={inviting || positionsLoading}
        >
          <InputLabel>Position</InputLabel>
          <Select
            value={positionId}
            label="Position"
            onChange={(e) => setPositionId(e.target.value as number)}
          >
            {positionsLoading ? (
              <MenuItem disabled>Loading positions…</MenuItem>
            ) : (
              positions.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* Show description only when a position is selected */}
        {selectedPosition && (
          <Typography variant="caption" color="text.secondary">
            Inviting as <strong>{selectedPosition.name}</strong>. The user will
            be assigned this position immediately upon accepting the invite.
          </Typography>
        )}

        {inviteError && <Alert severity="error">{inviteError}</Alert>}
        {inviteSuccess && (
          <Alert severity="success">Invitation sent successfully!</Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={inviting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleInvite}
          disabled={!email || positionId === "" || inviting}
          startIcon={
            inviting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {inviting ? "Sending…" : "Send Invite"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
