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
  IconButton,
  Tooltip,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/Edit";
import { createClient } from "@/library/supabase/client";
import { Tables } from "@/utilities/types/database";
import { ENGINE_STATUS } from "@/utilities/constants/apparatus.constant";

type EngineStatus = (typeof ENGINE_STATUS)[keyof typeof ENGINE_STATUS];

type LatestInspection = Pick<Tables<"Inspections">, "inspected_at"> & {
  Users: Pick<Tables<"Users">, "name"> | null;
};

type Props = {
  id: number;
  title: string;
  status: EngineStatus;
  onClick?: () => void;
  onStartCheck: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
};

const STATUS_CONFIG: Record<EngineStatus, { color: "success" | "error" }> = {
  [ENGINE_STATUS.READY]: { color: "success" },
  [ENGINE_STATUS.DOWN]: { color: "error" },
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
  onClick,
  onStartCheck,
  onEdit,
  canEdit = false,
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

  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[ENGINE_STATUS.READY];

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s, transform 0.15s",
        "&:hover": onClick
          ? {
              boxShadow: 4,
              transform: "translateY(-1px)",
            }
          : {},
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
            label={status}
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

        {/* Actions — stop propagation so card onClick doesn't fire */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          mt={1}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="contained"
            fullWidth
            startIcon={<ChecklistRtlIcon />}
            onClick={onStartCheck}
            color={statusCfg.color}
            sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
          >
            Start Check
          </Button>

          {/* Edit icon — only for allowed positions */}
          {canEdit && (
            <Tooltip title="Edit apparatus" placement="top" arrow>
              <IconButton
                size="small"
                onClick={onEdit}
                color="default"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
