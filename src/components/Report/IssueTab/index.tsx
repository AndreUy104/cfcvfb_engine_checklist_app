import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  IssueWithDetails,
  IssueStatus,
  IssuePriority,
} from "@/utilities/types/issues.types";
import ReportIssueModal from "./ReportIssueModal";
import IssueDetailModal from "./IssueDetailModal";

interface IssuesTabProps {
  issues: IssueWithDetails[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const STATUS_COLORS: Record<IssueStatus, "error" | "warning" | "success"> = {
  Open: "error",
  "In Progress": "warning",
  Resolved: "success",
};

const PRIORITY_COLORS: Record<IssuePriority, "success" | "warning" | "error"> =
  {
    Low: "success",
    Medium: "warning",
    High: "error",
  };

export default function IssuesTab({
  issues,
  loading,
  error,
  onRefresh,
}: IssuesTabProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueWithDetails | null>(
    null,
  );

  return (
    <>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setReportModalOpen(true)}
        >
          Report Issue
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography fontWeight={700}>Title</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={700}>Type</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={700}>Reported By</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={700}>Date</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={700}>Priority</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={700}>Status</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={700}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No issues reported yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                issues.map((issue) => (
                  <TableRow key={issue.id} hover>
                    <TableCell>
                      <Typography
                        fontWeight={600}
                        noWrap
                        sx={{ maxWidth: 200 }}
                      >
                        {issue.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{issue.type}</TableCell>
                    <TableCell>{issue.Users?.name ?? "—"}</TableCell>
                    <TableCell>
                      {new Date(issue.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={issue.priority}
                        size="small"
                        color={
                          PRIORITY_COLORS[issue.priority as IssuePriority] ??
                          "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={issue.status}
                        size="small"
                        color={
                          STATUS_COLORS[issue.status as IssueStatus] ??
                          "default"
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSuccess={onRefresh}
      />

      <IssueDetailModal
        isOpen={Boolean(selectedIssue)}
        onClose={() => setSelectedIssue(null)}
        issue={selectedIssue}
      />
    </>
  );
}
