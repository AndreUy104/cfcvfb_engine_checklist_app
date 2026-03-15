// src/utilities/types/engine.types.ts
import { Tables, TablesInsert, TablesUpdate } from "@/utilities/types/database"
import { EngineType } from "@/hooks/useEngineType"

export type { EngineType } 
export type Engine = Tables<"Engines">
export type EngineInsert = TablesInsert<"Engines">
export type EngineUpdate = TablesUpdate<"Engines">

export type EngineWithType = Engine & {
  Engine_type: EngineType | null
}