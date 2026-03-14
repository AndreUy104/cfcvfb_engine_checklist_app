import { Equipment } from "./equipment.types";

export type ThreeOptionStatus = "Good" | "Weak" | "Dead" | null;
export type TwoOptionStatus = "Operational" | "Faulty" | null;
export type EquipmentStatus = "Serviceable" | "Down" | null;
export type LevelStatus = "Full" | "3/4" | "1/2" | "1/4" | "Empty";

export interface ApparatusChecks {
  waterLevel: LevelStatus;
  fuelLevel: LevelStatus;
  lightsAndSiren: TwoOptionStatus;
  batteryStatus: ThreeOptionStatus;
  communicationRadio: TwoOptionStatus;
}

export interface EquipmentCheck {
  id: Equipment["id"];
  name: string;
  status: EquipmentStatus;
  notes: string;
}

export interface EngineCheckFormData {
  apparatusChecks: ApparatusChecks;
  equipmentChecks: EquipmentCheck[];
  remarks: string;
}
