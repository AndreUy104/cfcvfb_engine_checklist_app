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

import {
  Menu,
  Dashboard,
  Inventory,
  Description,
  Group,
  Settings,
  Logout,
  LocalFireDepartment,
  Build
} from "@mui/icons-material"
import { useRouter } from "next/navigation";

const drawerWidth = 260;

export default function Sidebar() {
  const router = useRouter()
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState("dashboard");

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Dashboard />, route: "/Home"},
    { id: "powerTools" , label: "Power Tools Inventory" , icon: <Build/> , route: "PowerTools" },
    { id: "inventory", label: "Inventory", icon: <Inventory />, route: "/Inventory"},
    { id: "reports", label: "Reports", icon: <Description /> },
    { id: "personnel", label: "Personnel", icon: <Group /> },
  ];

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        background: "linear-gradient(180deg,#2a0000,#3b0000)",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <LocalFireDepartment sx={{ color: "red" }} />
        <Typography fontWeight="bold">CFCVFB Engine Check List</Typography>
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
              router.push(item.route ?? '/Home')
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
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
        {/* Logout */}
        <ListItemButton
          sx={{
            borderRadius: 1,
            "&:hover": {
              backgroundColor: "rgba(255,0,0,0.15)",
            },
          }}
          onClick={() => {
            console.log("Logout clicked");
            router.push("/")
          }}
        >
          <ListItemIcon sx={{ color: "#ddd", minWidth: 36 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
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
              <Menu />
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
