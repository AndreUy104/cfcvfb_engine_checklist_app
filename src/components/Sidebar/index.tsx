"use client";

import React, { useState } from "react";
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
  Build,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import ChangePasswordModal from "@/components/ChangePasswordModal";

const drawerWidth = 260;

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route?: string;
  allowedPositions?: number[];
}

const ALL_MENU_ITEMS: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Dashboard />,
    route: "/Home",
  },
  {
    id: "powerTools",
    label: "Power Tools Inventory",
    icon: <Build />,
    route: "/PowerTools",
    allowedPositions: [1, 2, 3],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: <Inventory />,
    route: "/Inventory",
    allowedPositions: [1, 2, 3],
  },
  {
    id: "reports",
    label: "Reports",
    icon: <Description />,
    route: "/Reports",
    allowedPositions: [2, 3],
  },
  {
    id: "personnel",
    label: "Personnel",
    icon: <Group />,
    allowedPositions: [3],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const { logout, user, isFirstLogin } = useAuth();
  const { profile } = useUserProfile();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const toggleDrawer = () => setOpen(!open);

  const visibleMenuItems = ALL_MENU_ITEMS.filter((item) => {
    if (!item.allowedPositions) return true;
    if (!profile?.position_id) return false;
    return item.allowedPositions.includes(profile.position_id);
  });

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
        {visibleMenuItems.map((item) => (
          <ListItemButton
            key={item.id}
            onClick={() => {
              setActive(item.id);
              if (isMobile) setOpen(false);
              router.push(item.route ?? "/Home");
            }}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              backgroundColor: active === item.id ? "#ff1a1a" : "transparent",
              "&:hover": {
                backgroundColor:
                  active === item.id ? "#ff1a1a" : "rgba(255,0,0,0.15)",
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

      {/* Settings & Logout */}
      <List sx={{ px: 1 }}>
        <ListItemButton
          onClick={() => setIsPasswordModalOpen(true)}
          sx={{
            borderRadius: 1,
            "&:hover": { backgroundColor: "rgba(255,0,0,0.15)" },
          }}
        >
          <ListItemIcon sx={{ color: "#ddd", minWidth: 36 }}>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>

        <ListItemButton
          onClick={logout}
          sx={{
            borderRadius: 1,
            "&:hover": { backgroundColor: "rgba(255,0,0,0.15)" },
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
      {isMobile && (
        <AppBar position="fixed" color="primary">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={toggleDrawer}>
              <Menu />
            </IconButton>
            <Typography variant="h6">Fire Station Check</Typography>
          </Toolbar>
        </AppBar>
      )}

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

      <ChangePasswordModal
        isOpen={isPasswordModalOpen || isFirstLogin}
        onClose={() => setIsPasswordModalOpen(false)}
        email={user?.email ?? ""}
        isFirstLogin={isFirstLogin}
      />
    </>
  );
}
