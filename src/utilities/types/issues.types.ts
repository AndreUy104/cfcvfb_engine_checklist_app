import { Tables, TablesInsert, TablesUpdate } from "@/utilities/types/database";

export type Issue = Tables<"Issues">;
export type IssueInsert = TablesInsert<"Issues">;
export type IssueUpdate = TablesUpdate<"Issues">;

export type IssueType = "Equipment" | "Engine" | "PowerTool" | "General";
export type IssueStatus = "Open" | "In Progress" | "Resolved";
export type IssuePriority = "Low" | "Medium" | "High";

export type IssueWithDetails = Issue & {
  ReportedBy: Pick<Tables<"Users">, "id" | "name" | "unit_number"> | null;
  UpdatedBy: Pick<Tables<"Users">, "id" | "name"> | null;
  Engines: Pick<Tables<"Engines">, "id" | "name"> | null;
  Equipment: Pick<Tables<"Equipments">, "id" | "name"> | null;
  PowerTool: Pick<Tables<"Equipments">, "id" | "name"> | null;
};

export interface IssueFormData {
  type: IssueType | "";
  title: string;
  description: string;
  priority: IssuePriority;
  engine_id: number | null;
  equipment_id: number | null;
  power_tool_id: number | null;
}

export interface UpdateIssueFormData {
  status: IssueStatus;
  priority: IssuePriority;
  qa_by: string;
  repaired_by: string;
  start_date: string | null;
  end_date: string | null;
}

export const INITIAL_UPDATE_FORM: UpdateIssueFormData = {
  status: "Open",
  priority: "Medium",
  qa_by: "",
  repaired_by: "",
  start_date: null,
  end_date: null,
};
