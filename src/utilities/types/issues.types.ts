import { Tables, TablesInsert, TablesUpdate } from "@/utilities/types/database";

export type Issue = Tables<"Issues">;
export type IssueInsert = TablesInsert<"Issues">;
export type IssueUpdate = TablesUpdate<"Issues">;

export type IssueType = "Equipment" | "Engine" | "PowerTool" | "General";
export type IssueStatus = "Open" | "In Progress" | "Resolved";
export type IssuePriority = "Low" | "Medium" | "High";

export type IssueWithDetails = Issue & {
  Users: Pick<Tables<"Users">, "id" | "name" | "unit_number"> | null;
  Engines: Pick<Tables<"Engines">, "id" | "name"> | null;
  Equipment: Pick<Tables<"Equipments">, "id" | "name"> | null; // ✅ was Equipments
  PowerTool: Pick<Tables<"Equipments">, "id" | "name"> | null; // ✅ new
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
