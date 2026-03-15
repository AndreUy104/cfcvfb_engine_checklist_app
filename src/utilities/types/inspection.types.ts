import { Tables, TablesInsert } from "@/utilities/types/database";

export type Inspection = Tables<"Inspections">;
export type InspectionInsert = TablesInsert<"Inspections">;

export type InspectionEquipmentResult = Tables<"Inspection_Equipment_Results">;
export type InspectionEquipmentResultInsert =
  TablesInsert<"Inspection_Equipment_Results">;

export type InspectionWithDetails = Inspection & {
  Users: Pick<Tables<"Users">, "id" | "name" | "unit_number"> | null;
  Inspection_Equipment_Results: (InspectionEquipmentResult & {
    Engines_Equipment:
      | (Tables<"Engines_Equipment"> & {
          Equipments: Pick<Tables<"Equipments">, "id" | "name"> | null;
        })
      | null;
  })[];
};

// Power Tool Inspection
export type PowerToolInspection = Tables<"PowerTool_Inspections">;
export type PowerToolInspectionInsert = TablesInsert<"PowerTool_Inspections">;

export type PowerToolInspectionWithDetails = PowerToolInspection & {
  Users: Pick<Tables<"Users">, "id" | "name" | "unit_number"> | null;
  Equipments: Pick<Tables<"Equipments">, "id" | "name"> | null;
};

export interface PowerToolInspectionFormData {
  is_running: boolean;
  fuel_level: string;
  physical_condition: "Good" | "Damaged" | "";
  remarks: string;
}
