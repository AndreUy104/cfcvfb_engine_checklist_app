import { Tables, TablesInsert, TablesUpdate } from "@/utilities/types/database"
import { Equipment } from "@/utilities/types/equipment.types"

export type EngineEquipment = Tables<"Engines_Equipment">
export type EngineEquipmentInsert = TablesInsert<"Engines_Equipment">
export type EngineEquipmentUpdate = TablesUpdate<"Engines_Equipment">

export type EngineEquipmentWithDetails = EngineEquipment & {
  Equipments: Equipment | null
}