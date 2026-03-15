import { Tables, TablesInsert, TablesUpdate } from "@/utilities/types/database"

export type Equipment = Tables<"Equipments">
export type EquipmentInsert = TablesInsert<"Equipments">
export type EquipmentUpdate = TablesUpdate<"Equipments">

export interface EquipmentColumn {
  key: keyof Equipment | "actions"
  label: string
  labelSuffix?: React.ReactNode
  align?: "left" | "right" | "center"
  renderCell?: (row: Equipment) => React.ReactNode
}

export interface EquipmentFormData {
  name: string
  total_quantity: number | ""
  total_in_service: number | ""
  total_down: number | ""
  is_power_tool: boolean
}

export type PowerToolStatus = "OK" | "In Repair" | "Down"

export interface PowerTool {
  id: string
  name: string
  lastChecked: string
  status: PowerToolStatus
}

export interface PowerToolColumn {
  key: keyof Equipment | "actions"
  label: string
  align?: "left" | "center" | "right"
  labelSuffix?: React.ReactNode
  renderCell: (row: Equipment) => React.ReactNode
}

export interface PowerToolCheckFormData {
  toolId: string
  running: boolean
  fuel: string
  remarks: string
}