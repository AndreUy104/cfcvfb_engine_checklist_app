"use client";

import React from "react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory2";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

const drawerWidth = 260;

export default function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState("dashboard");

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { id: "inventory", label: "Inventory", icon: <InventoryIcon /> },
    { id: "reports", label: "Reports", icon: <DescriptionIcon /> },
    { id: "personnel", label: "Personnel", icon: <GroupIcon /> },
  ];

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        color: "#fff",
        background: "linear-gradient(180deg,#2a0000,#3b0000)",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <LocalFireDepartmentIcon sx={{ color: "red" }} />
        <Typography fontWeight="bold">Fire Station Check</Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,0,0,0.2)" }} />

      {/* Station Info */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="caption"
          sx={{ color: "red", fontWeight: "bold", letterSpacing: 1 }}
        >
          STATION 42
        </Typography>

        <Typography variant="body2" sx={{ color: "#aaa" }}>
          On Duty: B-Shift (North)
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,0,0,0.15)" }} />

      {/* Menu */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.id}
            onClick={() => {
              setActive(item.id);
              if (isMobile) setOpen(false);
            }}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              backgroundColor:
                active === item.id ? "#ff1a1a" : "transparent",
              "&:hover": {
                backgroundColor:
                  active === item.id
                    ? "#ff1a1a"
                    : "rgba(255,0,0,0.15)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#ddd", minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: active === item.id ? 600 : 400,
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ borderColor: "rgba(255,0,0,0.15)" }} />

      {/* Settings */}
      <List sx={{ px: 1 }}>
        <ListItemButton
          sx={{
            borderRadius: 1,
            "&:hover": {
              backgroundColor: "rgba(255,0,0,0.15)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#ddd", minWidth: 36 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      {isMobile && (
        <AppBar position="fixed" color="primary">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6">
              Fire Station Check
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={toggleDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            borderRight: "none",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
