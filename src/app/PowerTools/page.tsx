import PowerToolsCheckTable from "@/components/PowerToolsTable";
import { Box, Typography } from "@mui/material";

export default function PowerToolsPage() {
  return (
    <>
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          gap={{ xs: 2, sm: 0 }}
          mb={3}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.4rem", sm: "2.125rem" } }}
          >
            Power Tools Inventory
          </Typography>
        </Box>
        <PowerToolsCheckTable />
      </Box>
    </>
  );
}
