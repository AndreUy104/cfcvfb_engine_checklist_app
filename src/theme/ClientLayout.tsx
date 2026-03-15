"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Box } from "@mui/material";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      {children}
    </Box>
  );
}