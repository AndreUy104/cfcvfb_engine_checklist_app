import { useMemo, useState } from "react";
import { createClient } from "@/library/supabase/client";
import type {
  PpeItemInsert,
  PpeItemUpdate,
  PpeItemWithAvailable,
  PpeTransaction,
  FirefighterPpeBalance,
  IssueReturnPpeInput,
  FirefighterIdentity,
  BulkIssuePpeInput,
  BulkReturnPpeInput,
} from "@/utilities/types/ppe.types";
import toast from "react-hot-toast";

// Translates the discriminated FirefighterIdentity union into the RPC's
// p_user_id / p_firefighter_name pair, omitting (not null-ing) the unused
// one. The Supabase-generated arg types declare these as optional
// (`?: string`), not nullable (`| null`), so `undefined` is required here —
// sending `null` fails to typecheck even though Postgres treats an omitted
// key and an explicit null identically (both params default to null).
function firefighterIdentityToRpcParams(identity: FirefighterIdentity) {
  return identity.kind === "registered"
    ? { p_user_id: identity.userId, p_firefighter_name: undefined }
    : { p_user_id: undefined, p_firefighter_name: identity.firefighterName };
}

interface UsePpeReturn {
  ppeItems: PpeItemWithAvailable[];
  ppeItem: PpeItemWithAvailable | null;
  loading: boolean;
  error: string | null;
  fetchPpeItems: () => Promise<void>;
  fetchPpeItem: (id: number) => Promise<void>;
  createPpeItem: (data: PpeItemInsert) => Promise<boolean>;
  updatePpeItem: (id: number, data: PpeItemUpdate) => Promise<boolean>;
  deletePpeItem: (id: number) => Promise<boolean>;
  findExistingCombo: (
    brand: string,
    model: string,
    category: string,
    size: string,
  ) => PpeItemWithAvailable | undefined;
  uploadSignature: (dataUrl: string) => Promise<string | null>;
  issuePpe: (input: IssueReturnPpeInput) => Promise<PpeTransaction | null>;
  returnPpe: (input: IssueReturnPpeInput) => Promise<PpeTransaction | null>;
  issuePpeBulk: (input: BulkIssuePpeInput) => Promise<PpeTransaction[] | null>;
  returnPpeBulk: (
    input: BulkReturnPpeInput,
  ) => Promise<PpeTransaction[] | null>;
  fetchFirefighterBalance: (
    firefighter: FirefighterIdentity,
  ) => Promise<FirefighterPpeBalance[]>;
}

export function usePpe(): UsePpeReturn {
  const supabase = useMemo(() => createClient(), []);

  const [ppeItems, setPpeItems] = useState<PpeItemWithAvailable[]>([]);
  const [ppeItem, setPpeItem] = useState<PpeItemWithAvailable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPpeItems = async () => {
    setLoading(true);
    setError(null);

    // Read from the view, not the base table, so `available`/`is_low_stock`
    // come pre-computed and the UI never has to derive them itself.
    const { data, error } = await supabase
      .from("PpeItemsWithAvailable")
      .select("*")
      .order("category", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setPpeItems(data);
    }

    setLoading(false);
  };

  const fetchPpeItem = async (id: number) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("PpeItemsWithAvailable")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setPpeItem(data);
    }

    setLoading(false);
  };

  const createPpeItem = async (data: PpeItemInsert): Promise<boolean> => {
    setLoading(true);
    setError(null);

    // Writes go to the base table — the view is read-only (its Insert/Update
    // shapes in the generated types are placeholders, not real writable columns).
    const { error } = await supabase.from("PpeItems").insert(data);

    if (error) {
      // Surfaces the ppe_items_unique_combo constraint message if the caller
      // didn't already check findExistingCombo before submitting.
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return false;
    }

    await fetchPpeItems();
    toast.success("PPE Item Added");
    setLoading(false);
    return true;
  };

  const updatePpeItem = async (
    id: number,
    data: PpeItemUpdate,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("PpeItems").update(data).eq("id", id);

    if (error) {
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return false;
    }

    await fetchPpeItems();
    toast.success("PPE Item Updated");
    setLoading(false);
    return true;
  };

  const deletePpeItem = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    // The DB trigger (ppe_items_prevent_delete_if_issued) is the real guard;
    // this call will fail server-side with a clear message if issued > 0.
    const { error } = await supabase.from("PpeItems").delete().eq("id", id);

    if (error) {
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return false;
    }

    setPpeItems((prev) => prev.filter((p) => p.id !== id));
    setLoading(false);
    toast.success("PPE Item Deleted");
    return true;
  };

  // Client-side pre-check used by the Add modal to prompt "merge instead?"
  // before attempting an insert. The DB unique constraint is the real backstop;
  // this just gives a nicer UX than waiting for a 23505 error.
  const findExistingCombo = (
    brand: string,
    model: string,
    category: string,
    size: string,
  ): PpeItemWithAvailable | undefined => {
    return ppeItems.find(
      (item) =>
        item.brand?.trim().toLowerCase() === brand.trim().toLowerCase() &&
        item.model?.trim().toLowerCase() === model.trim().toLowerCase() &&
        item.category === category &&
        item.size?.trim().toLowerCase() === size.trim().toLowerCase(),
    );
  };

  // Converts the SignaturePad's PNG data URL into a real Blob and uploads it
  // to the private ppe-signatures bucket. Called BEFORE issuePpe/returnPpe
  // (and before issuePpeBulk/returnPpeBulk) — the RPC needs a real
  // signature_path at insert time, and the transaction's id (the more
  // "natural" filename) doesn't exist until the RPC has already run. Using
  // a client-generated unique name instead avoids that ordering problem
  // entirely; worst case on an RPC failure afterward (e.g. insufficient
  // stock) is one harmless orphaned PNG, not a broken transaction record.
  const uploadSignature = async (dataUrl: string): Promise<string | null> => {
    try {
      // Data URL -> Blob. fetch() against a data: URL is a standard, simple
      // way to do this conversion without a manual base64 decode.
      const blob = await (await fetch(dataUrl)).blob();

      const uniqueId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = `signatures/${uniqueId}.png`;

      const { error } = await supabase.storage
        .from("ppe-signatures")
        .upload(path, blob, {
          contentType: "image/png",
          upsert: false,
        });

      if (error) {
        setError(error.message);
        toast.error(`Could not save signature: ${error.message}`);
        return null;
      }

      return path;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Signature upload failed";
      setError(message);
      toast.error(message);
      return null;
    }
  };

  const issuePpe = async (
    input: IssueReturnPpeInput,
  ): Promise<PpeTransaction | null> => {
    setLoading(true);
    setError(null);

    // recorded_by is NOT passed here — issue_ppe resolves it server-side
    // from the session via auth.uid() -> Users.auth_id. Never trust the
    // client for who performed the action.
    const { data, error } = await supabase.rpc("issue_ppe", {
      p_ppe_item_id: input.ppeItemId,
      ...firefighterIdentityToRpcParams(input.firefighter),
      p_quantity: input.quantity,
      p_condition: input.condition,
      p_signature_path: input.signaturePath,
      p_occurred_at: input.occurredAt,
      p_approved_by_name: input.approvedByName,
    });

    if (error) {
      // Surfaces RPC-raised messages directly, e.g.
      // "Cannot issue N unit(s): only M available"
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return null;
    }

    await fetchPpeItems();
    toast.success("PPE Issued");
    setLoading(false);
    return data;
  };

  const returnPpe = async (
    input: IssueReturnPpeInput,
  ): Promise<PpeTransaction | null> => {
    setLoading(true);
    setError(null);

    // approved_by_name is not part of the return_ppe RPC — only issue_ppe
    // requires an approving officer. Return transactions are self-authorising.
    const { data, error } = await supabase.rpc("return_ppe", {
      p_ppe_item_id: input.ppeItemId,
      ...firefighterIdentityToRpcParams(input.firefighter),
      p_quantity: input.quantity,
      p_condition: input.condition,
      p_signature_path: input.signaturePath,
      p_occurred_at: input.occurredAt,
    });

    if (error) {
      // Surfaces e.g. "Cannot return N unit(s): firefighter only holds M of this item"
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return null;
    }

    await fetchPpeItems();
    toast.success("PPE Returned");
    setLoading(false);
    return data;
  };

  // Bulk issue — one firefighter, one signature, N line items, all inserted
  // atomically by issue_ppe_bulk. The RPC returns setof "PpeTransactions",
  // so `data` here is already the array of inserted rows (one per line item).
  const issuePpeBulk = async (
    input: BulkIssuePpeInput,
  ): Promise<PpeTransaction[] | null> => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("issue_ppe_bulk", {
      p_items: input.items.map((line) => ({
        ppe_item_id: line.ppeItemId,
        quantity: line.quantity,
        condition: line.condition,
      })),
      ...firefighterIdentityToRpcParams(input.firefighter),
      p_signature_path: input.signaturePath,
      p_occurred_at: input.occurredAt,
      p_approved_by_name: input.approvedByName,
    });

    if (error) {
      // Whole batch failed — nothing was written. Surfaces which specific
      // line item broke it, e.g. "Cannot issue 3 unit(s) of item 12: only 1 available"
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return null;
    }

    await fetchPpeItems();
    toast.success(
      `${input.items.length} item${input.items.length === 1 ? "" : "s"} issued`,
    );
    setLoading(false);
    return data;
  };

  // Bulk return — mirrors issuePpeBulk without approved_by_name.
  const returnPpeBulk = async (
    input: BulkReturnPpeInput,
  ): Promise<PpeTransaction[] | null> => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("return_ppe_bulk", {
      p_items: input.items.map((line) => ({
        ppe_item_id: line.ppeItemId,
        quantity: line.quantity,
        condition: line.condition,
      })),
      ...firefighterIdentityToRpcParams(input.firefighter),
      p_signature_path: input.signaturePath,
      p_occurred_at: input.occurredAt,
    });

    if (error) {
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return null;
    }

    await fetchPpeItems();
    toast.success(
      `${input.items.length} item${input.items.length === 1 ? "" : "s"} returned`,
    );
    setLoading(false);
    return data;
  };

  // Powers the Return modal's item dropdown: filtered to what a specific
  // firefighter actually currently holds, per the spec requirement that
  // returns can't exceed what they were issued. Accepts either identity
  // kind since FirefighterPpeBalances is keyed on user_id OR firefighter_name.
  const fetchFirefighterBalance = async (
    firefighter: FirefighterIdentity,
  ): Promise<FirefighterPpeBalance[]> => {
    const query = supabase.from("FirefighterPpeBalances").select("*");

    const { data, error } =
      firefighter.kind === "registered"
        ? await query.eq("user_id", firefighter.userId)
        : await query.eq("firefighter_name", firefighter.firefighterName);

    if (error) {
      setError(error.message);
      toast.error(error.message);
      return [];
    }

    return data ?? [];
  };

  return {
    ppeItems,
    ppeItem,
    loading,
    error,
    fetchPpeItems,
    fetchPpeItem,
    createPpeItem,
    updatePpeItem,
    deletePpeItem,
    findExistingCombo,
    uploadSignature,
    issuePpe,
    returnPpe,
    issuePpeBulk,
    returnPpeBulk,
    fetchFirefighterBalance,
  };
}
