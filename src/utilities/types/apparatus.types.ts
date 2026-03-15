import { Tables, TablesInsert, TablesUpdate } from "@/utilities/types/database"
import { EngineType } from "@/utilities/types/engine.types"

export type Apparatus = Tables<"Engines">
export type ApparatusInsert = TablesInsert<"Engines">
export type ApparatusUpdate = TablesUpdate<"Engines">

export type ApparatusWithType = Apparatus & {
  Engine_type: EngineType | null
}

export interface ApparatusFormData {
  name: string
  type: number | "" 
  water_capacity: number | ""
  plate_number: string
}