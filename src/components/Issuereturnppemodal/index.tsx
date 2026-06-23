"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Box,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import { useTheme } from "@mui/material/styles";
import { usePpe } from "@/hooks/usePpe";
import { usePpeTransactions } from "@/hooks/usePpeTransactions";
import { useAllUsers } from "@/hooks/useUsers";
import {
  PpeItemWithAvailable,
  PpeCondition,
  PPE_CONDITIONS,
  IssueReturnMode,
  FirefighterIdentity,
  FirefighterPpeBalance,
} from "@/utilities/types/ppe.types";
import SignaturePad, { SignaturePadHandle } from "../Signaturepad";

interface IssueReturnPpeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  ppeItems: PpeItemWithAvailable[];
  /** Optional — preselects mode (e.g. opened from a specific row's "Issue" action) */
  initialMode?: IssueReturnMode;
}

const todayLocalDate = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
};

export default function IssueReturnPpeModal({
  isOpen,
  onClose,
  onSuccess,
  ppeItems,
  initialMode = "issue",
}: IssueReturnPpeModalProps) {
  const theme = useTheme();
  const {
    issuePpe,
    returnPpe,
    fetchFirefighterBalance,
    uploadSignature,
    loading,
    error,
  } = usePpe();
  const { fetchKnownFirefighterNames } = usePpeTransactions();
  const { users } = useAllUsers();

  const signaturePadRef = useRef<SignaturePadHandle>(null);

  const [mode, setMode] = useState<IssueReturnMode>(initialMode);
  const [firefighterMode, setFirefighterMode] = useState<
    "registered" | "unregistered"
  >("registered");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [firefighterName, setFirefighterName] = useState("");
  const [knownNames, setKnownNames] = useState<string[]>([]);
  const [ppeItemId, setPpeItemId] = useState<number | "">("");
  const [quantity, setQuantity] = useState<string>("1");
  const [condition, setCondition] = useState<PpeCondition | "">("");
  const [occurredAt, setOccurredAt] = useState(todayLocalDate());
  const [approvedByName, setApprovedByName] = useState("");
  const [signatureTouched, setSignatureTouched] = useState(false);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Return mode needs the selected firefighter's current balances, to
  // filter the item dropdown to only what they actually hold.
  const [returnBalances, setReturnBalances] = useState<FirefighterPpeBalance[]>(
    [],
  );
  const [balancesLoading, setBalancesLoading] = useState(false);

  // Load known unregistered-firefighter names once when the modal opens,
  // to power the freeSolo autocomplete suggestions.
  useEffect(() => {
    if (isOpen) {
      fetchKnownFirefighterNames().then(setKnownNames);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const currentFirefighter: FirefighterIdentity | null =
    firefighterMode === "registered"
      ? selectedUserId !== ""
        ? { kind: "registered", userId: Number(selectedUserId) }
        : null
      : firefighterName.trim() !== ""
        ? { kind: "unregistered", firefighterName: firefighterName.trim() }
        : null;

  // Re-fetch balances whenever the active firefighter changes, but only in
  // return mode (issue mode doesn't need this).
  useEffect(() => {
    if (mode !== "return" || !currentFirefighter) {
      setReturnBalances([]);
      return;
    }
    setBalancesLoading(true);
    fetchFirefighterBalance(currentFirefighter)
      .then(setReturnBalances)
      .finally(() => setBalancesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    firefighterMode,
    selectedUserId,
    firefighterName /* intentionally NOT currentFirefighter — see note below */,
  ]);

  // Items available to pick from, scoped to the active mode:
  // - issue: anything with available > 0
  // - return: only items the selected firefighter currently holds (per
  //   returnBalances), per spec — can't return what wasn't issued to them
  //
  // The `.id is number` predicate also narrows away the `number | null` on
  // id that PpeItemWithAvailable carries (it's view-derived, so Postgres/
  // PostgREST can't express NOT NULL on view columns even though id is
  // never actually null in practice). Without this, MenuItem's `value`/`key`
  // props below reject `number | null`.
  const eligibleItems = (
    mode === "issue"
      ? ppeItems.filter((item) => (item.available ?? 0) > 0)
      : ppeItems.filter((item) =>
          returnBalances.some(
            (b) => b.ppe_item_id === item.id && (b.quantity_held ?? 0) > 0,
          ),
        )
  ).filter(
    (item): item is PpeItemWithAvailable & { id: number } => item.id != null,
  );

  const selectedItem = ppeItems.find((item) => item.id === ppeItemId) ?? null;

  const selectedItemHeldQuantity =
    mode === "return" && selectedItem
      ? (returnBalances.find((b) => b.ppe_item_id === selectedItem.id)
          ?.quantity_held ?? 0)
      : null;

  const quantityNum = quantity === "" ? 0 : Number(quantity);

  const quantityError =
    mode === "issue" &&
    selectedItem &&
    quantityNum > (selectedItem.available ?? 0)
      ? `Only ${selectedItem.available} available`
      : mode === "return" &&
          selectedItemHeldQuantity !== null &&
          quantityNum > selectedItemHeldQuantity
        ? `Firefighter only holds ${selectedItemHeldQuantity}`
        : null;

  const canSubmit =
    Boolean(currentFirefighter) &&
    ppeItemId !== "" &&
    quantityNum > 0 &&
    !quantityError &&
    condition !== "" &&
    occurredAt !== "" &&
    !isSignatureEmpty;

  function resetForm() {
    setMode(initialMode);
    setFirefighterMode("registered");
    setSelectedUserId("");
    setFirefighterName("");
    setPpeItemId("");
    setQuantity("1");
    setCondition("");
    setOccurredAt(todayLocalDate());
    setApprovedByName("");
    setReturnBalances([]);
    setSignatureTouched(false);
    setIsSignatureEmpty(true);
    setUploading(false);
    signaturePadRef.current?.clear();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleModeChange(
    _: React.MouseEvent<HTMLElement>,
    next: IssueReturnMode | null,
  ) {
    if (!next) return;
    setMode(next);
    // Switching modes invalidates the item selection (eligible sets differ).
    setPpeItemId("");
  }

  async function handleSubmit() {
    if (!currentFirefighter || ppeItemId === "" || condition === "") return;

    const signatureDataUrl = signaturePadRef.current?.getDataUrl();
    if (!signatureDataUrl) {
      setSignatureTouched(true);
      return;
    }

    setUploading(true);
    const signaturePath = await uploadSignature(signatureDataUrl);
    setUploading(false);

    if (!signaturePath) {
      // uploadSignature already surfaced a toast/error message — stop here
      // rather than submitting with a missing/fake signature.
      return;
    }

    const input = {
      ppeItemId: Number(ppeItemId),
      firefighter: currentFirefighter,
      quantity: quantityNum,
      condition,
      signaturePath,
      occurredAt: new Date(occurredAt).toISOString(),
      approvedByName: mode === "issue" ? approvedByName.trim() || "" : "",
    };

    const result =
      mode === "issue" ? await issuePpe(input) : await returnPpe(input);

    if (result) {
      onSuccess?.();
      handleClose();
    }
  }

  const fieldSx = {
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.5)",
      fontWeight: 600,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.secondary.main,
    },
    "& .MuiOutlinedInput-root": {
      color: "#e8e8e8",
      bgcolor: "rgba(255,255,255,0.04)",
      borderRadius: 1.5,
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
      "&.Mui-focused fieldset": { borderColor: theme.palette.secondary.main },
    },
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.primary.main,
          border: `1px solid ${theme.palette.secondary.main}30`,
          borderRadius: 2,
          boxShadow: `0 0 60px ${theme.palette.secondary.main}20, 0 20px 60px rgba(0,0,0,0.6)`,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: `${theme.palette.primary.main}cc`,
          borderBottom: `1px solid ${theme.palette.secondary.main}25`,
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#f0f0f0",
            }}
          >
            Issue / Return PPE
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            Log a signed issuance or return transaction
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        {/* Mode toggle */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          fullWidth
          sx={{
            "& .MuiToggleButton-root": {
              color: "rgba(255,255,255,0.5)",
              borderColor: "rgba(255,255,255,0.15)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              fontSize: "0.78rem",
              py: 1,
              "&.Mui-selected": {
                color: "#fff",
                background: `${theme.palette.secondary.main}25`,
                borderColor: theme.palette.secondary.main,
                "&:hover": {
                  background: `${theme.palette.secondary.main}35`,
                },
              },
            },
          }}
        >
          <ToggleButton value="issue">
            <AssignmentTurnedInOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
            Issue
          </ToggleButton>
          <ToggleButton value="return">
            <AssignmentReturnOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
            Return
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Firefighter identity */}
        <Box>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.75rem",
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Firefighter
          </Typography>
          <RadioGroup
            row
            value={firefighterMode}
            onChange={(e) => {
              setFirefighterMode(
                e.target.value as "registered" | "unregistered",
              );
              setSelectedUserId("");
              setFirefighterName("");
            }}
            sx={{ mb: 1 }}
          >
            <FormControlLabel
              value="registered"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.3)",
                    "&.Mui-checked": { color: theme.palette.secondary.main },
                  }}
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.65)" }}
                >
                  Registered user
                </Typography>
              }
            />
            <FormControlLabel
              value="unregistered"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.3)",
                    "&.Mui-checked": { color: theme.palette.secondary.main },
                  }}
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.65)" }}
                >
                  Not registered (enter name)
                </Typography>
              }
            />
          </RadioGroup>

          {firefighterMode === "registered" ? (
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Select firefighter</InputLabel>
              <Select
                label="Select firefighter"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value as number)}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                    {u.unit_number ? ` — Unit ${u.unit_number}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Autocomplete
              freeSolo
              options={knownNames}
              value={firefighterName}
              onInputChange={(_, newValue) => setFirefighterName(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Firefighter name"
                  placeholder="Type full name…"
                  helperText="Use the same spelling each time so returns match correctly"
                  FormHelperTextProps={{
                    sx: { color: "rgba(255,255,255,0.35)" },
                  }}
                  sx={fieldSx}
                />
              )}
            />
          )}
        </Box>

        {/* PPE item */}
        <FormControl fullWidth sx={fieldSx} disabled={!currentFirefighter}>
          <InputLabel>
            {mode === "issue" ? "Item to issue" : "Item to return"}
          </InputLabel>
          <Select
            label={mode === "issue" ? "Item to issue" : "Item to return"}
            value={ppeItemId}
            onChange={(e) => setPpeItemId(e.target.value as number)}
          >
            {eligibleItems.length === 0 ? (
              <MenuItem value="" disabled>
                {mode === "issue"
                  ? "No items currently available"
                  : balancesLoading
                    ? "Loading…"
                    : currentFirefighter
                      ? "This firefighter holds nothing currently"
                      : "Select a firefighter first"}
              </MenuItem>
            ) : (
              eligibleItems.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.brand} — {item.model} ({item.size}){" "}
                  {mode === "issue"
                    ? `· ${item.available} available`
                    : `· holds ${
                        returnBalances.find((b) => b.ppe_item_id === item.id)
                          ?.quantity_held ?? 0
                      }`}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            variant="outlined"
            inputProps={{ min: 1 }}
            error={Boolean(quantityError)}
            helperText={quantityError ?? undefined}
            FormHelperTextProps={{ sx: { color: "#f44336" } }}
            sx={fieldSx}
          />
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Condition</InputLabel>
            <Select
              label="Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as PpeCondition)}
            >
              {PPE_CONDITIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TextField
          label="Date"
          type="date"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          fullWidth
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          sx={fieldSx}
        />

        {/* Approved by — issue mode only */}
        {mode === "issue" && (
          <TextField
            label="Approved by"
            value={approvedByName}
            onChange={(e) => setApprovedByName(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Name of approving officer…"
            sx={fieldSx}
          />
        )}

        <SignaturePad ref={signaturePadRef} onChange={setIsSignatureEmpty} />
        {signatureTouched && isSignatureEmpty && (
          <Alert severity="warning" sx={{ mt: -1 }}>
            A signature is required to confirm this transaction.
          </Alert>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: `${theme.palette.secondary.main}20` }} />

      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            color: "rgba(255,255,255,0.5)",
            borderColor: "rgba(255,255,255,0.15)",
            "&:hover": {
              borderColor: "rgba(255,255,255,0.35)",
              color: "rgba(255,255,255,0.85)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          startIcon={
            mode === "issue" ? (
              <AssignmentTurnedInOutlinedIcon />
            ) : (
              <AssignmentReturnOutlinedIcon />
            )
          }
          disabled={loading || uploading || !canSubmit}
          sx={{ fontWeight: 700, letterSpacing: "0.06em" }}
        >
          {uploading
            ? "Saving signature…"
            : mode === "issue"
              ? "Issue PPE"
              : "Return PPE"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
