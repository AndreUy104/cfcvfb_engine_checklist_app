"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
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
  BulkPpeLineItem,
} from "@/utilities/types/ppe.types";
import SignaturePad, { SignaturePadHandle } from "@/components/Signaturepad";

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

function itemLabel(item: PpeItemWithAvailable) {
  return `${item.category} — ${item.brand} (${item.size})`;
}

export default function IssueReturnPpeModal({
  isOpen,
  onClose,
  onSuccess,
  ppeItems,
  initialMode = "issue",
}: IssueReturnPpeModalProps) {
  const theme = useTheme();
  const {
    issuePpeBulk,
    returnPpeBulk,
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
  const [occurredAt, setOccurredAt] = useState(todayLocalDate());
  const [approvedByName, setApprovedByName] = useState("");
  const [signatureTouched, setSignatureTouched] = useState(false);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
  const [uploading, setUploading] = useState(false);

  // --- Cart (line items) -----------------------------------------------
  // One firefighter, one signature, one signed event — but potentially
  // several PPE items. Each cart line is added via the builder row below.
  const [cart, setCart] = useState<BulkPpeLineItem[]>([]);

  // Builder row state — a "staging" line item not yet added to the cart.
  const [builderItemId, setBuilderItemId] = useState<number | "">("");
  const [builderQuantity, setBuilderQuantity] = useState<string>("1");
  const [builderCondition, setBuilderCondition] = useState<PpeCondition | "">(
    "",
  );

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

  // A cart built up for one firefighter doesn't make sense for another —
  // stock/balance eligibility differs per person. Clear it whenever the
  // active firefighter or mode changes.
  useEffect(() => {
    setCart([]);
    setBuilderItemId("");
    setBuilderQuantity("1");
    setBuilderCondition("");
  }, [mode, firefighterMode, selectedUserId, firefighterName]);

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

  // Total quantity already staged in the cart for a given item, across all
  // its lines (a firefighter can return e.g. 2 "Good" + 1 "Damaged" of the
  // same item as two separate cart lines).
  function cartQtyForItem(itemId: number): number {
    return cart
      .filter((l) => l.ppeItemId === itemId)
      .reduce((sum, l) => sum + l.quantity, 0);
  }

  // Items available to pick from in the builder, scoped to the active mode:
  // - issue: anything with (available - already in cart) > 0
  // - return: only items the selected firefighter currently holds, minus
  //   whatever's already staged in the cart for that item
  //
  // The `.id is number` predicate also narrows away the `number | null` on
  // id that PpeItemWithAvailable carries (it's view-derived, so Postgres/
  // PostgREST can't express NOT NULL on view columns even though id is
  // never actually null in practice). Without this, MenuItem's `value`/`key`
  // props below reject `number | null`.
  const safePpeItems = ppeItems ?? [];

  const eligibleItems = (
    mode === "issue"
      ? safePpeItems.filter(
          (item) =>
            item.id != null &&
            (item.available ?? 0) - cartQtyForItem(item.id) > 0,
        )
      : safePpeItems.filter((item) => {
          if (item.id == null) return false;

          const held =
            returnBalances.find((b) => b.ppe_item_id === item.id)
              ?.quantity_held ?? 0;

          return held - cartQtyForItem(item.id) > 0;
        })
  ).filter(
    (item): item is PpeItemWithAvailable & { id: number } => item.id != null,
  );

  const builderItem =
    (ppeItems ?? []).find((item) => item.id === builderItemId) ?? null;

  const builderMaxAllowed = useMemo(() => {
    if (!builderItem || builderItem.id == null) return 0;
    const already = cartQtyForItem(builderItem.id);
    if (mode === "issue") {
      return (builderItem.available ?? 0) - already;
    }
    const held =
      returnBalances.find((b) => b.ppe_item_id === builderItem.id)
        ?.quantity_held ?? 0;
    return held - already;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builderItem, mode, returnBalances, cart]);

  const builderQuantityNum =
    builderQuantity === "" ? 0 : Number(builderQuantity);

  const builderQuantityError =
    builderItem && builderQuantityNum > builderMaxAllowed
      ? mode === "issue"
        ? `Only ${builderMaxAllowed} available`
        : `Firefighter only holds ${builderMaxAllowed} more of this item`
      : null;

  const canAddToCart =
    builderItemId !== "" &&
    builderCondition !== "" &&
    builderQuantityNum > 0 &&
    !builderQuantityError;

  function handleAddToCart() {
    if (!canAddToCart || builderItemId === null || builderCondition === null)
      return;

    setCart((prev) => {
      // Merge into an existing line only if item AND condition both match —
      // two lines for the same item with different conditions stay separate
      // (e.g. 2 gloves "Good" + 1 glove "Damaged").
      const existingIdx = prev.findIndex(
        (l) =>
          l.ppeItemId === builderItemId && l.condition === builderCondition,
      );
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + builderQuantityNum,
        };
        return next;
      }
      return [
        ...prev,
        {
          ppeItemId: builderItemId as number,
          quantity: builderQuantityNum,
          condition: builderCondition as PpeCondition,
        },
      ];
    });

    // Reset the builder row for the next item, but keep condition — issuing/
    // returning a full gear set is often all the same condition ("New" on
    // issue, "Good" on return), so re-selecting it every line is friction.
    setBuilderItemId("");
    setBuilderQuantity("1");
  }

  function handleRemoveCartLine(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  const totalCartUnits = cart.reduce((sum, l) => sum + l.quantity, 0);

  const canSubmit =
    Boolean(currentFirefighter) &&
    cart.length > 0 &&
    occurredAt !== "" &&
    !isSignatureEmpty &&
    (mode === "return" || approvedByName.trim() !== "");

  function resetForm() {
    setMode(initialMode);
    setFirefighterMode("registered");
    setSelectedUserId("");
    setFirefighterName("");
    setCart([]);
    setBuilderItemId("");
    setBuilderQuantity("1");
    setBuilderCondition("");
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
    // cart clearing handled by the mode-watching effect above
  }

  async function handleSubmit() {
    if (!currentFirefighter || cart.length === 0) return;

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

    const occurredAtIso = new Date(occurredAt).toISOString();

    const result =
      mode === "issue"
        ? await issuePpeBulk({
            items: cart,
            firefighter: currentFirefighter,
            signaturePath,
            occurredAt: occurredAtIso,
            approvedByName: approvedByName.trim(),
          })
        : await returnPpeBulk({
            items: cart,
            firefighter: currentFirefighter,
            signaturePath,
            occurredAt: occurredAtIso,
          });

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
            Log a signed issuance or return — add as many items as needed
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

        <Divider sx={{ borderColor: `${theme.palette.secondary.main}15` }} />

        {/* Item builder — add one line at a time to the cart below */}
        <Box>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.75rem",
              fontWeight: 600,
              mb: 1,
            }}
          >
            {mode === "issue" ? "Add item to issue" : "Add item to return"}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 1fr",
              gap: 1.5,
              alignItems: "flex-start",
            }}
          >
            <FormControl
              fullWidth
              sx={fieldSx}
              disabled={!currentFirefighter}
              size="small"
            >
              <InputLabel>Item</InputLabel>
              <Select
                label="Item"
                value={builderItemId}
                onChange={(e) => setBuilderItemId(e.target.value as number)}
              >
                {eligibleItems.length === 0 ? (
                  <MenuItem value="" disabled>
                    {mode === "issue"
                      ? "No items currently available"
                      : balancesLoading
                        ? "Loading…"
                        : currentFirefighter
                          ? "Nothing left to add"
                          : "Select a firefighter first"}
                  </MenuItem>
                ) : (
                  eligibleItems.map((item) => {
                    const remaining =
                      mode === "issue"
                        ? (item.available ?? 0) - cartQtyForItem(item.id)
                        : (returnBalances.find((b) => b.ppe_item_id === item.id)
                            ?.quantity_held ?? 0) - cartQtyForItem(item.id);
                    return (
                      <MenuItem key={item.id} value={item.id}>
                        {itemLabel(item)} · {remaining} left
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>

            <TextField
              label="Qty"
              type="number"
              size="small"
              value={builderQuantity}
              onChange={(e) => setBuilderQuantity(e.target.value)}
              disabled={!builderItemId}
              inputProps={{ min: 1 }}
              error={Boolean(builderQuantityError)}
              sx={fieldSx}
            />

            <FormControl
              fullWidth
              sx={fieldSx}
              disabled={!builderItemId}
              size="small"
            >
              <InputLabel>Condition</InputLabel>
              <Select
                label="Condition"
                value={builderCondition}
                onChange={(e) =>
                  setBuilderCondition(e.target.value as PpeCondition)
                }
              >
                {PPE_CONDITIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {builderQuantityError && (
            <Typography
              variant="caption"
              sx={{ color: "#f44336", display: "block", mt: 0.5 }}
            >
              {builderQuantityError}
            </Typography>
          )}

          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            startIcon={<AddCircleOutlineIcon />}
            size="small"
            sx={{
              mt: 1,
              color: theme.palette.secondary.main,
              fontWeight: 700,
              "&.Mui-disabled": { color: "rgba(255,255,255,0.2)" },
            }}
          >
            Add to list
          </Button>
        </Box>

        {/* Cart — the accumulated line items for this event */}
        <Box>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.75rem",
              fontWeight: 600,
              mb: 1,
            }}
          >
            Items in this {mode === "issue" ? "issuance" : "return"}
            {cart.length > 0 && (
              <Typography
                component="span"
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.35)", ml: 1 }}
              >
                {cart.length} line{cart.length === 1 ? "" : "s"} ·{" "}
                {totalCartUnits} unit{totalCartUnits === 1 ? "" : "s"} total
              </Typography>
            )}
          </Typography>

          {cart.length === 0 ? (
            <Box
              sx={{
                border: "1px dashed rgba(255,255,255,0.15)",
                borderRadius: 1.5,
                py: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.35)" }}
              >
                No items added yet
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
              }}
            >
              {cart.map((line, index) => {
                const item = ppeItems.find((i) => i.id === line.ppeItemId);
                return (
                  <Box
                    key={`${line.ppeItemId}-${line.condition}-${index}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 1.5,
                      px: 1.5,
                      py: 0.75,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#e8e8e8", fontWeight: 600 }}
                      >
                        {item ? itemLabel(item) : `Item #${line.ppeItemId}`}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.75, mt: 0.25 }}>
                        <Chip
                          label={`Qty ${line.quantity}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            bgcolor: `${theme.palette.secondary.main}20`,
                            color: theme.palette.secondary.main,
                          }}
                        />
                        <Chip
                          label={line.condition}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            bgcolor: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.6)",
                          }}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveCartLine(index)}
                      sx={{
                        color: "rgba(255,255,255,0.35)",
                        "&:hover": { color: "#f44336" },
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          )}
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
            required
            error={approvedByName.trim() === "" && cart.length > 0}
            helperText={
              approvedByName.trim() === "" && cart.length > 0
                ? "Required to issue PPE"
                : undefined
            }
            FormHelperTextProps={{ sx: { color: "#f44336" } }}
            sx={fieldSx}
          />
        )}

        <SignaturePad ref={signaturePadRef} onChange={setIsSignatureEmpty} />
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.35)", mt: -1.5 }}
        >
          One signature covers every item listed above
        </Typography>
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
              ? `Issue ${cart.length > 0 ? `${cart.length} item${cart.length === 1 ? "" : "s"}` : "PPE"}`
              : `Return ${cart.length > 0 ? `${cart.length} item${cart.length === 1 ? "" : "s"}` : "PPE"}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
