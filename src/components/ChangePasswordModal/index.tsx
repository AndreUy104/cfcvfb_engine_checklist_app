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
  InputAdornment,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useTheme } from "@mui/material/styles";
import {
  ChangePasswordFormData,
  ChangePasswordModalProps,
} from "@/utilities/types/users.types";
import { useAuth } from "@/hooks/useAuth";

export default function ChangePasswordModal({
  isOpen,
  onClose,
  email,
  isFirstLogin = false,
}: ChangePasswordModalProps) {
  const theme = useTheme();
  const { changePassword, loading, error } = useAuth();

  const [form, setForm] = useState<ChangePasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState<Partial<ChangePasswordFormData>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function toggleShow(field: keyof typeof show) {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function validate(): boolean {
    const newErrors: Partial<ChangePasswordFormData> = {};

    if (!isFirstLogin && !form.oldPassword) {
      newErrors.oldPassword = "Current password is required.";
    }
    if (!form.newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await changePassword(form.newPassword);
    if (!error) handleClose();
  }

  function handleClose() {
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setShow({ oldPassword: false, newPassword: false, confirmPassword: false });
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
    "& .MuiFormHelperText-root": { color: "#ef4444", mx: 0 },
  };

  const eyeBtn = (field: keyof typeof show) => (
    <InputAdornment position="end">
      <IconButton
        size="small"
        onClick={() => toggleShow(field)}
        edge="end"
        sx={{
          color: "rgba(255,255,255,0.3)",
          "&:hover": { color: "rgba(255,255,255,0.7)" },
        }}
      >
        {show[field] ? (
          <VisibilityOff fontSize="small" />
        ) : (
          <Visibility fontSize="small" />
        )}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={!isFirstLogin ? handleClose : undefined}
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
      {/* Header */}
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
            {isFirstLogin ? "Set Your Password" : "Change Password"}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            {isFirstLogin
              ? "Create a password to secure your account"
              : "Update your account password"}
          </Typography>
        </Box>
        {!isFirstLogin && (
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              color: "rgba(255,255,255,0.4)",
              "&:hover": { color: "#fff" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>

      {/* Body */}
      <DialogContent
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* API error */}
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        {/* Email display */}
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: 1.5,
            bgcolor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.4)", display: "block", mb: 0.25 }}
          >
            Account
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#e8e8e8", fontWeight: 600 }}
          >
            {email}
          </Typography>
        </Box>

        {/* Current password — only for non-first-login */}
        {!isFirstLogin && (
          <TextField
            label="Current Password"
            name="oldPassword"
            type={show.oldPassword ? "text" : "password"}
            value={form.oldPassword}
            onChange={handleChange}
            error={Boolean(errors.oldPassword)}
            helperText={errors.oldPassword}
            fullWidth
            variant="outlined"
            InputProps={{ endAdornment: eyeBtn("oldPassword") }}
            sx={fieldSx}
          />
        )}

        <TextField
          label="New Password"
          name="newPassword"
          type={show.newPassword ? "text" : "password"}
          value={form.newPassword}
          onChange={handleChange}
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword}
          fullWidth
          variant="outlined"
          InputProps={{ endAdornment: eyeBtn("newPassword") }}
          sx={fieldSx}
        />

        <TextField
          label="Confirm New Password"
          name="confirmPassword"
          type={show.confirmPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={handleChange}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword}
          fullWidth
          variant="outlined"
          InputProps={{ endAdornment: eyeBtn("confirmPassword") }}
          sx={fieldSx}
        />
      </DialogContent>

      <Divider sx={{ borderColor: `${theme.palette.secondary.main}20` }} />

      {/* Footer */}
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        {!isFirstLogin && (
          <Button
            onClick={handleClose}
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
        )}
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          fullWidth={isFirstLogin}
          startIcon={<LockResetIcon />}
          disabled={loading}
          sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
        >
          {isFirstLogin ? "Set Password" : "Update Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
