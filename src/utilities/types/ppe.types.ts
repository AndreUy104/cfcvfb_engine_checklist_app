import {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from "@/utilities/types/database";

export type PpeItem = Tables<"PpeItems">;
export type PpeItemInsert = TablesInsert<"PpeItems">;
export type PpeItemUpdate = TablesUpdate<"PpeItems">;

// Read model — includes the derived `available` / `is_low_stock` fields from
// the PpeItemsWithAvailable view. Use this for anything the table/cards render;
// use PpeItem (above) only for insert/update payload shaping.
export type PpeItemWithAvailable = Tables<"PpeItemsWithAvailable">;

export type PpeTransaction = Tables<"PpeTransactions">;
export type PpeTransactionInsert = TablesInsert<"PpeTransactions">;

export type FirefighterPpeBalance = Tables<"FirefighterPpeBalances">;

export type PpeCategory = Enums<"ppe_category">;
export type PpeCondition = Enums<"ppe_condition">;
export type PpeTransactionType = Enums<"ppe_transaction_type">;

export const PPE_CATEGORIES: PpeCategory[] = [
  "Helmet",
  "Turnout Coat",
  "Turnout Pants",
  "Boots",
  "Gloves",
  "Hood",
  "SCBA",
];

export const PPE_CONDITIONS: PpeCondition[] = [
  "New",
  "Good",
  "Fair",
  "Poor",
  "Damaged",
];

// Low-stock threshold mirrors PpeItemsWithAvailable.is_low_stock (<=15% available)
// for any client-side spots that want the same flag without round-tripping the view.
export const PPE_LOW_STOCK_THRESHOLD = 0.15;

export interface PpeColumn {
  key: keyof PpeItemWithAvailable | "actions";
  label: string;
  labelSuffix?: React.ReactNode;
  align?: "left" | "right" | "center";
  renderCell?: (row: PpeItemWithAvailable) => React.ReactNode;
}

export interface PpeFormData {
  category: PpeCategory | "";
  brand: string;
  model: string;
  size: string;
  total: string | number | "";
}

// Mirrors the DB's ppe_transactions_firefighter_identity_xor constraint:
// a firefighter is identified EITHER by a registered Users.id OR by a
// free-text name (for firefighters with no Users row) — never both, never
// neither. Modeled as a discriminated union so call sites can't accidentally
// supply both or omit both; TypeScript enforces the same shape the DB does.
export type FirefighterIdentity =
  | { kind: "registered"; userId: number }
  | { kind: "unregistered"; firefighterName: string };

// Args shape for issue_ppe/return_ppe RPCs (single item). recorded_by is
// intentionally absent — it's resolved server-side from the session, never
// sent by the client.
export interface IssueReturnPpeInput {
  ppeItemId: number;
  firefighter: FirefighterIdentity;
  quantity: number;
  condition: PpeCondition;
  signaturePath: string;
  occurredAt?: string;
  approvedByName: string;
}

export type IssueReturnMode = "issue" | "return";

// Form state is looser than IssueReturnPpeInput (string inputs, partial
// selection mid-edit) — converted to FirefighterIdentity only on submit.
export interface IssueReturnFormData {
  mode: IssueReturnMode;
  firefighterMode: "registered" | "unregistered";
  userId: number | "";
  firefighterName: string;
  ppeItemId: number | "";
  quantity: string | number | "";
  condition: PpeCondition | "";
  occurredAt: string;
}

// ----------------------------------------------------------------------------
// Bulk issue/return — one firefighter, one signature, one signed event,
// multiple PPE line items. Backed by the issue_ppe_bulk / return_ppe_bulk
// RPCs, which run the whole batch as one atomic transaction.
// ----------------------------------------------------------------------------

// A single line in the cart. Two lines CAN share the same ppeItemId (e.g.
// returning 2 gloves in "Good" condition and 1 in "Damaged") — the RPC
// handles that correctly by re-checking availability/balance per line.
export interface BulkPpeLineItem {
  ppeItemId: number;
  quantity: number;
  condition: PpeCondition;
}

export interface BulkIssuePpeInput {
  items: BulkPpeLineItem[];
  firefighter: FirefighterIdentity;
  signaturePath: string;
  occurredAt?: string;
  approvedByName: string;
}

export interface BulkReturnPpeInput {
  items: BulkPpeLineItem[];
  firefighter: FirefighterIdentity;
  signaturePath: string;
  occurredAt?: string;
}
