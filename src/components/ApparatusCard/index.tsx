"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  Skeleton,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { createClient } from "@/library/supabase/client";
import { Tables } from "@/utilities/types/database";

type LatestInspection = Pick<Tables<"Inspections">, "inspected_at"> & {
  Users: Pick<Tables<"Users">, "name"> | null;
};

type Props = {
  id: number;
  title: string;
  status: "ready" | "progress" | "alert";
  onStartCheck: () => void;
};

const STATUS_CONFIG = {
  ready: { label: "Ready", color: "success" as const },
  progress: { label: "In Progress", color: "warning" as const },
  alert: { label: "Alert", color: "error" as const },
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function ApparatusCard({
  id,
  title,
  status,
  onStartCheck,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [latestInspection, setLatestInspection] =
    useState<LatestInspection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await supabase
        .from("Inspections")
        .select("inspected_at, Users (name)")
        .eq("engine_id", id)
        .order("inspected_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLatestInspection(data as LatestInspection | null);
      setLoading(false);
    };

    fetchLatest();
  }, [id, supabase]);

  const statusCfg = STATUS_CONFIG[status];

  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsCarIcon fontSize="small" color="action" />
            <Typography variant="h6" fontWeight={700} fontSize="1rem">
              {title}
            </Typography>
          </Box>
          <Chip
            label={statusCfg.label}
            color={statusCfg.color}
            size="small"
            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
          />
        </Box>

        <Divider />

        {/* Last inspection info */}
        {loading ? (
          <Box display="flex" flexDirection="column" gap={1}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" />
          </Box>
        ) : latestInspection ? (
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={0.75}>
              <AccessTimeIcon
                fontSize="small"
                color="action"
                sx={{ fontSize: 16 }}
              />
              <Typography variant="body2" color="text.secondary">
                {formatRelativeTime(latestInspection.inspected_at)}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                (
                {new Date(latestInspection.inspected_at).toLocaleDateString(
                  "en-PH",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
                )
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.75}>
              <PersonOutlineIcon
                fontSize="small"
                color="action"
                sx={{ fontSize: 16 }}
              />
              <Typography variant="body2" color="text.secondary">
                {latestInspection.Users?.name ?? "Unknown"}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap={0.75}>
            <AccessTimeIcon
              fontSize="small"
              color="disabled"
              sx={{ fontSize: 16 }}
            />
            <Typography variant="body2" color="text.disabled">
              No inspection yet
            </Typography>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Action */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<ChecklistRtlIcon />}
          onClick={onStartCheck}
          color={statusCfg.color}
          sx={{ fontWeight: 700, letterSpacing: "0.06em", mt: 1 }}
        >
          Start Check
        </Button>
      </CardContent>
    </Card>
  );
}
