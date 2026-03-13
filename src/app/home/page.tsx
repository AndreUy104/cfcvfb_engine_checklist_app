"use client";

import { useState } from "react";
import ApparatusCard from "@/components/ApparatusCard";
import Sidebar from "@/components/Sidebar";
import { Box, Button, Grid, Tab, Tabs, Typography } from "@mui/material";
import { messageEnum } from "@/utilities/constants/message.constant";

export default function HomePage() {
    const [tab, setTab] = useState(0);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { xs: "100%", md: "auto" },
                    overflowX: "hidden",
                    mt: { xs: "64px", md: 0 },
                }}
            >
                {/* Header */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={{ xs: 2, sm: 0 }}
                    mb={3}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{ fontSize: { xs: "1.4rem", sm: "2.125rem" } }}
                        >
                            APPARATUS DASHBOARD
                        </Typography>

                        <Typography
                            color="gray"
                            sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
                        >
                            {messageEnum.DashboardDetails}
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{
                            width: { xs: "100%", sm: "auto" },
                            mt: { xs: 1, sm: 0 },
                        }}
                    >
                        + New Report
                    </Button>
                </Box>

                {/* Tabs */}
                <Tabs
                    value={tab}
                    onChange={(e, val) => setTab(val)}
                    textColor="secondary"
                    indicatorColor="secondary"
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{ mb: 3 }}
                >
                    <Tab label="All Engines" />
                    <Tab label="Engines" />
                    <Tab label="Tankers" />
                </Tabs>

                {/* Grid */}
                <Grid container spacing={{ xs: 2, sm: 3 }} mt={1} sx={{ p: { xs: 0, sm: 1, md: 3 } }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <ApparatusCard status="ready" title="Engine 1" />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <ApparatusCard status="progress" title="Ladder 5" />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <ApparatusCard status="alert" title="Rescue 1" />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <ApparatusCard status="ready" title="Engine 2" />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
