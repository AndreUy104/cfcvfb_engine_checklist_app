import { useState, useEffect } from "react";
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
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";
import {
  IssueFormData,
  IssueType,
  IssuePriority,
} from "@/utilities/types/issues.types";
import { useIssues } from "@/hooks/useIssues";
import { useEngine } from "@/hooks/useEngine";
import { useEquipment } from "@/hooks/useEquipment";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ISSUE_TYPES: IssueType[] = [
  "Engine",
  "Equipment",
  "PowerTool",
  "General",
];
const PRIORITIES: IssuePriority[] = ["Low", "Medium", "High"];

const INITIAL_FORM: IssueFormData = {
  type: "",
  title: "",
  description: "",
  priority: "Medium",
  engine_id: null,
  equipment_id: null,
  power_tool_id: null,
};

export default function ReportIssueModal({
  isOpen,
  onClose,
  onSuccess,
}: ReportIssueModalProps) {
  const { submitIssue, loading, error } = useIssues();
  const { engines, fetchEngines } = useEngine();
  const { equipments, powerTools, fetchEquipments, fetchPowerTools } =
    useEquipment();
  const [form, setForm] = useState<IssueFormData>(INITIAL_FORM);

  useEffect(() => {
    if (isOpen) {
      fetchEngines();
      fetchEquipments();
      fetchPowerTools();
    }
  }, [isOpen]);

  function handleChange(
    field: keyof IssueFormData,
    value: string | number | null,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "type" && {
        engine_id: null,
        equipment_id: null,
        power_tool_id: null,
      }),
    }));
  }

  async function handleSubmit() {
    if (!form.type || !form.title) return;
    const success = await submitIssue(form);
    if (success) {
      handleClose();
      onSuccess();
    }
  }

  function handleClose() {
    setForm(INITIAL_FORM);
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
            Report Issue
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Submit a new issue report
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          select
          label="Issue Type"
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
          fullWidth
        >
          <MenuItem value="" disabled>
            Select issue type
          </MenuItem>
          {ISSUE_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        {form.type === "Engine" && (
          <TextField
            select
            label="Engine"
            value={form.engine_id ?? ""}
            onChange={(e) => handleChange("engine_id", Number(e.target.value))}
            fullWidth
          >
            <MenuItem value="" disabled>
              Select engine
            </MenuItem>
            {engines.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.name}
              </MenuItem>
            ))}
          </TextField>
        )}
        {form.type === "Equipment" && (
          <TextField
            select
            label="Equipment"
            value={form.equipment_id ?? ""}
            onChange={(e) =>
              handleChange("equipment_id", Number(e.target.value))
            }
            fullWidth
          >
            <MenuItem value="" disabled>
              Select equipment
            </MenuItem>
            {equipments.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.name}
              </MenuItem>
            ))}
          </TextField>
        )}
        {form.type === "PowerTool" && (
          <TextField
            select
            label="Power Tool"
            value={form.power_tool_id ?? ""}
            onChange={(e) =>
              handleChange("power_tool_id", Number(e.target.value))
            }
            fullWidth
          >
            <MenuItem value="" disabled>
              Select power tool
            </MenuItem>
            {powerTools.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          label="Title"
          placeholder="Brief description of the issue"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          placeholder="Provide more details..."
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          fullWidth
          multiline
          rows={3}
        />

        <TextField
          select
          label="Priority"
          value={form.priority}
          onChange={(e) => handleChange("priority", e.target.value)}
          fullWidth
        >
          {PRIORITIES.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <Divider />
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !form.type || !form.title}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FlagIcon />
            )
          }
        >
          Submit Issue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
