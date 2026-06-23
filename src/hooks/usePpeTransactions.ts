import { useMemo, useState } from "react";
import { createClient } from "@/library/supabase/client";
import type {
  PpeTransaction,
  PpeTransactionType,
} from "@/utilities/types/ppe.types";
import toast from "react-hot-toast";

// Joined shape for display — pulls in the firefighter/recorder names and item
// details rather than making the log view show raw foreign key ids.
//
// `firefighter` will be null when the transaction belongs to an unregistered
// firefighter (no Users row to join against) — in that case, use the row's
// own `firefighter_name` column directly. Use getFirefighterDisplayName()
// below rather than reading `firefighter?.name` alone, or unregistered rows
// will silently render blank.
export interface PpeTransactionRow extends PpeTransaction {
  ppe_item: {
    id: number;
    brand: string;
    model: string;
    category: string;
    size: string;
  } | null;
  firefighter: {
    id: number;
    name: string | null;
  } | null;
  recorder: {
    id: number;
    name: string | null;
  } | null;
}

// Resolves the right display name regardless of whether the transaction's
// firefighter is registered (joined Users row) or unregistered (free-text
// firefighter_name column on the transaction itself).
export function getFirefighterDisplayName(row: PpeTransactionRow): string {
  return row.firefighter?.name ?? row.firefighter_name ?? "Unknown";
}

export interface PpeTransactionFilters {
  userId?: number;
  firefighterName?: string;
  ppeItemId?: number;
  type?: PpeTransactionType;
}

const SIGNATURE_BUCKET = "ppe-signatures";
const SIGNED_URL_EXPIRY_SECONDS = 300; // 5 minutes, matches the RLS comment

interface UsePpeTransactionsReturn {
  transactions: PpeTransactionRow[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  fetchPpeTransactions: (
    filters: PpeTransactionFilters,
    page: number,
    rowsPerPage: number,
  ) => Promise<void>;
  getSignatureUrl: (signaturePath: string) => Promise<string | null>;
  fetchKnownFirefighterNames: () => Promise<string[]>;
}

export function usePpeTransactions(): UsePpeTransactionsReturn {
  const supabase = useMemo(() => createClient(), []);

  const [transactions, setTransactions] = useState<PpeTransactionRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPpeTransactions = async (
    filters: PpeTransactionFilters,
    page: number,
    rowsPerPage: number,
  ) => {
    setLoading(true);
    setError(null);

    const from = page * rowsPerPage;
    const to = from + rowsPerPage - 1;

    // Read-only — this hook never writes to PpeTransactions. All mutations
    // go through usePpe's issuePpe/returnPpe (the issue_ppe/return_ppe RPCs).
    let query = supabase
      .from("PpeTransactions")
      .select(
        `
        *,
        ppe_item:PpeItems!PpeTransactions_ppe_item_id_fkey (
          id, brand, model, category, size
        ),
        firefighter:Users!PpeTransactions_user_id_fkey (
          id, name
        ),
        recorder:Users!PpeTransactions_recorded_by_fkey (
          id, name
        )
      `,
        { count: "exact" },
      )
      .order("occurred_at", { ascending: false })
      .range(from, to);

    if (filters.userId !== undefined) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters.firefighterName !== undefined) {
      query = query.eq("firefighter_name", filters.firefighterName);
    }
    if (filters.ppeItemId !== undefined) {
      query = query.eq("ppe_item_id", filters.ppeItemId);
    }
    if (filters.type !== undefined) {
      query = query.eq("type", filters.type);
    }

    const { data, error, count } = await query;

    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      setTransactions(data as unknown as PpeTransactionRow[]);
      setTotalCount(count ?? 0);
    }

    setLoading(false);
  };

  // Resolves a stored signature_path to a short-lived signed URL for display.
  // The bucket is private (per RLS), so the raw path alone isn't viewable —
  // every render of a signature needs a fresh signed URL, not a cached one.
  const getSignatureUrl = async (
    signaturePath: string,
  ): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from(SIGNATURE_BUCKET)
      .createSignedUrl(signaturePath, SIGNED_URL_EXPIRY_SECONDS);

    if (error) {
      toast.error(`Could not load signature: ${error.message}`);
      return null;
    }

    return data.signedUrl;
  };

  // Distinct firefighter_name values previously used for unregistered
  // firefighters, so the Issue/Return form can offer autocomplete suggestions
  // instead of staff retyping a name from scratch each time. Consistent
  // spelling matters here — see the note on return_ppe's balance matching.
  const fetchKnownFirefighterNames = async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from("PpeTransactions")
      .select("firefighter_name")
      .not("firefighter_name", "is", null);

    if (error) {
      toast.error(`Could not load known firefighter names: ${error.message}`);
      return [];
    }

    const names = (data ?? [])
      .map((row) => row.firefighter_name)
      .filter((name): name is string => Boolean(name));

    return Array.from(new Set(names)).sort();
  };

  return {
    transactions,
    totalCount,
    loading,
    error,
    fetchPpeTransactions,
    getSignatureUrl,
    fetchKnownFirefighterNames,
  };
}
