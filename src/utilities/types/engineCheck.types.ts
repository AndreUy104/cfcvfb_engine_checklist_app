import { Tables } from "@/utilities/types/database";

export type ThreeOptionStatus = "Good" | "Weak" | "Dead" | null;
export type TwoOptionStatus = "Operational" | "Faulty" | null;
export type EquipmentStatus = "Serviceable" | "Down" | null;
export type LevelStatus = "Full" | "3/4" | "1/2" | "1/4" | "Empty";

export interface ApparatusChecks {
  waterLevel: LevelStatus;
  fuelLevel: LevelStatus;
  lightsAndSiren: TwoOptionStatus;
  batteryAVoltage: string;
  batteryBVoltage: string;
  communicationRadio: TwoOptionStatus;
}

export interface EquipmentCheck {
  engineEquipmentId: Tables<"Inspection_Equipment_Results">["engine_equipment_id"];
  name: string;
  status: EquipmentStatus | null;
  notes: Tables<"Inspection_Equipment_Results">["notes"];
  quantity_assigned: Tables<"Engines_Equipment">["quantity_assigned"];
  location_on_truck: Tables<"Engines_Equipment">["location_on_truck"];
}

export interface EngineCheckFormData {
  apparatusChecks: ApparatusChecks;
  equipmentChecks: EquipmentCheck[];
  remarks: string;
}
