import { useForm, Controller } from "react-hook-form";
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
  Grid,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { toast } from "react-hot-toast";
import {
  IssueWithDetails,
  IssueStatus,
  IssuePriority,
  UpdateIssueFormData,
} from "@/utilities/types/issues.types";
import { useIssues } from "@/hooks/useIssues";

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: IssueWithDetails | null;
  onRefresh: () => void;
}

const STATUS_OPTIONS: IssueStatus[] = ["Open", "In Progress", "Resolved"];
const PRIORITY_OPTIONS: IssuePriority[] = ["Low", "Medium", "High"];

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
  onRefresh,
}: IssueDetailModalProps) {
  const { updateIssue, loading } = useIssues();

  const { control, handleSubmit, watch, reset } = useForm<UpdateIssueFormData>({
    defaultValues: {
      status: (issue?.status as IssueStatus) ?? "Open",
      priority: (issue?.priority as IssuePriority) ?? "Medium",
      qa_by: issue?.qa_by ?? "",
      repaired_by: issue?.repaired_by ?? "",
      start_date: issue?.start_date ?? null,
      end_date: issue?.end_date ?? null,
    },
  });

  const currentStatus = watch("status");
  const isResolved = issue?.status === "Resolved";

  if (!issue) return null;

  async function onSubmit(form: UpdateIssueFormData) {
    const success = await updateIssue(issue!.id, form);
    if (success) {
      toast.success("Issue updated successfully");
      onRefresh();
      onClose();
    } else {
      toast.error("Failed to update issue");
    }
  }

  async function handleReopen() {
    const currentValues = watch();
    const success = await updateIssue(issue!.id, {
      ...currentValues,
      status: "Open",
    });
    if (success) {
      reset({ ...currentValues, status: "Open" });
      toast.success("Issue reopened successfully");
      onRefresh();
      onClose();
    } else {
      toast.error("Failed to reopen issue");
    }
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
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
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        {/* Title + status chip */}
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
            label={currentStatus}
            size="small"
            color={STATUS_COLORS[currentStatus] ?? "default"}
          />
        </Box>

        <Divider />

        {/* Read-only info */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <InfoRow label="Type" value={issue.type} />
          <InfoRow
            label="Reported By"
            value={issue.ReportedBy?.name ?? "Unknown"}
          />
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
          {issue.updated_at && (
            <InfoRow
              label="Last Updated"
              value={new Date(issue.updated_at).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          )}
          {issue.UpdatedBy && (
            <InfoRow label="Last Updated By" value={issue.UpdatedBy.name} />
          )}
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

        <Divider textAlign="left">
          <Typography variant="caption" color="text.secondary">
            Maintenance Update
          </Typography>
        </Divider>

        {isResolved ? (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <InfoRow
              label="Status"
              value={<Chip label="Resolved" size="small" color="success" />}
            />
            <InfoRow label="Priority" value={issue.priority} />
            <InfoRow label="Repaired By" value={issue.repaired_by ?? "—"} />
            <InfoRow label="QA By" value={issue.qa_by ?? "—"} />
            <InfoRow label="Start Date" value={issue.start_date ?? "—"} />
            <InfoRow label="End Date" value={issue.end_date ?? "—"} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid size={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Status"
                    fullWidth
                    disabled={loading}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Priority"
                    fullWidth
                    disabled={loading}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="repaired_by"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Repaired By"
                    placeholder="Name of technician"
                    fullWidth
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="qa_by"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="QA By"
                    placeholder="Name of QA / approver"
                    fullWidth
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    label="Start Date"
                    type="date"
                    fullWidth
                    disabled={loading}
                    slotProps={{ inputLabel: { shrink: true } }}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    label="End Date"
                    type="date"
                    fullWidth
                    disabled={loading}
                    slotProps={{ inputLabel: { shrink: true } }}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                )}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <Divider />
      <DialogActions>
        <Button onClick={handleClose}>{isResolved ? "Close" : "Cancel"}</Button>
        {isResolved ? (
          <Button
            onClick={handleReopen}
            variant="outlined"
            color="warning"
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <LockOpenIcon />
              )
            }
          >
            Reopen Issue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
          >
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
