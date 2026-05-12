"use client";

import {
  Box,
  Typography,
  Switch,
  CircularProgress,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import { ToggleOn, Info } from "@mui/icons-material";
import {
  useComponentSettings,
  type ComponentSetting,
} from "@/hooks/useComponentSetting";

export default function ComponentSettingsPage() {
  const {
    settings,
    loading,
    togglingKey,
    error,
    successKey,
    toggleSetting,
    setError,
  } = useComponentSettings();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#1a0000",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <ToggleOn sx={{ color: "#ff1a1a", fontSize: 32 }} />
        <Typography variant="h5" fontWeight={700} color="#fff">
          Component Settings
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.45)", mb: 3 }}
      >
        Enable or disable UI components across the application. Changes take
        effect immediately for all users.
      </Typography>

      <Divider sx={{ borderColor: "rgba(255,0,0,0.15)", mb: 3 }} />

      {/* Error banner */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            mb: 3,
            bgcolor: "rgba(239,68,68,0.15)",
            color: "#ef4444",
          }}
        >
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress sx={{ color: "#ff1a1a" }} />
        </Box>
      ) : settings.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            mt: 8,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <Info sx={{ fontSize: 48 }} />
          <Typography>No components registered yet.</Typography>
          <Typography variant="caption">
            Run <code>npm run component:create</code> to add one.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {settings.map((setting: ComponentSetting) => (
            <Box
              key={setting.component_key}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                px: 3,
                py: 2.5,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.04)",
                border: "1px solid",
                borderColor: setting.is_enabled
                  ? "rgba(255,26,26,0.3)"
                  : "rgba(255,255,255,0.08)",
                transition: "border-color 0.2s",
              }}
            >
              {/* Left: info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography
                    fontWeight={600}
                    sx={{ color: "#fff", fontSize: "0.95rem" }}
                  >
                    {setting.label}
                  </Typography>

                  {successKey === setting.component_key && (
                    <Chip
                      label="Saved"
                      size="small"
                      sx={{
                        bgcolor: "rgba(34,197,94,0.15)",
                        color: "#22c55e",
                        border: "1px solid rgba(34,197,94,0.4)",
                        height: 20,
                        fontSize: "0.7rem",
                      }}
                    />
                  )}
                </Box>

                {setting.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.4)",
                      mb: 1,
                    }}
                  >
                    {setting.description}
                  </Typography>
                )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.25)",
                      fontFamily: "monospace",
                    }}
                  >
                    {setting.component_key}
                  </Typography>

                  <Chip
                    label={setting.is_enabled ? "Enabled" : "Disabled"}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.65rem",
                      bgcolor: setting.is_enabled
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.15)",
                      color: setting.is_enabled ? "#22c55e" : "#ef4444",
                      border: "1px solid",
                      borderColor: setting.is_enabled
                        ? "rgba(34,197,94,0.4)"
                        : "rgba(239,68,68,0.4)",
                    }}
                  />
                </Box>
              </Box>

              {/* Right: toggle */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {togglingKey === setting.component_key ? (
                  <CircularProgress size={24} sx={{ color: "#ff1a1a" }} />
                ) : (
                  <Switch
                    checked={setting.is_enabled}
                    onChange={() => toggleSetting(setting)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#ff1a1a",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          bgcolor: "#ff1a1a",
                        },
                    }}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
