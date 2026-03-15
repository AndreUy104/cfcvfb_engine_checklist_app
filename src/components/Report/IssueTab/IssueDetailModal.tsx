import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Divider,
  Chip,
  MenuItem,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { IssueWithDetails, IssueStatus } from "@/utilities/types/issues.types";
import { useIssues } from "@/hooks/useIssues";

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: IssueWithDetails | null;
}

const STATUS_OPTIONS: IssueStatus[] = ["Open", "In Progress", "Resolved"];

const STATUS_COLORS: Record<IssueStatus, "error" | "warning" | "success"> = {
  Open: "error",
  "In Progress": "warning",
  Resolved: "success",
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={700}
      sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
    >
      {label}
    </Typography>
    <Typography variant="body2">{value ?? "—"}</Typography>
  </Box>
);

export default function IssueDetailModal({
  isOpen,
  onClose,
  issue,
}: IssueDetailModalProps) {
  const { updateIssueStatus, loading } = useIssues();

  if (!issue) return null;

  async function handleStatusChange(status: IssueStatus) {
    await updateIssueStatus(issue!.id, status);
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            fontWeight={700}
            sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
          >
            Issue Details
          </Typography>
          <Typography variant="caption" color="text.secondary">
            #{issue.id} — {issue.type}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        {/* Title + status */}
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={2}
        >
          <Typography variant="h6" fontWeight={700}>
            {issue.title}
          </Typography>
          <Chip
            label={issue.status}
            size="small"
            color={STATUS_COLORS[issue.status as IssueStatus] ?? "default"}
          />
        </Box>

        <Divider />

        {/* Info grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <InfoRow label="Type" value={issue.type} />
          <InfoRow label="Priority" value={issue.priority} />
          <InfoRow label="Reported By" value={issue.Users?.name ?? "Unknown"} />
          <InfoRow
            label="Date Reported"
            value={new Date(issue.created_at).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          {issue.Engines && (
            <InfoRow label="Engine" value={issue.Engines.name ?? "—"} />
          )}
          {issue.Equipment && (
            <InfoRow label="Equipment" value={issue.Equipment.name ?? "—"} />
          )}
          {issue.PowerTool && (
            <InfoRow label="Power Tool" value={issue.PowerTool.name ?? "—"} />
          )}
        </Box>

        {/* Description */}
        {issue.description && (
          <>
            <Divider />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
              >
                Description
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                {issue.description}
              </Typography>
            </Box>
          </>
        )}

        <Divider />

        {/* Status update */}
        <TextField
          select
          label="Update Status"
          value={issue.status}
          onChange={(e) => handleStatusChange(e.target.value as IssueStatus)}
          fullWidth
          disabled={loading}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <Divider />
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
