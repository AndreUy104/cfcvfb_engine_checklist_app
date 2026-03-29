"use client";

import UserTable from "@/components/UsersTable";
import { Box } from "@mui/material";

export default function PersonnelPage() {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: { xs: 2, sm: 3 },
        width: { xs: "100%", md: "auto" },
        minWidth: 0,
        overflowX: "hidden",
        mt: { xs: "64px", md: 0 },
      }}
    >
      <UserTable />
    </Box>
  );
}
