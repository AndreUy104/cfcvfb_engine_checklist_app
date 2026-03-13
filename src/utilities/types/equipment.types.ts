export type EquipmentStatus = "In Service" | "Repair" | "Out of Service";

export interface Equipment {
  id: number | string;
  name: string;
  status: EquipmentStatus;
  apparatus: string;
  lastInspected: string; 
}


export interface EquipmentColumn {
  key: keyof Equipment | "actions";
  label: string;
  labelSuffix?: React.ReactNode;
  align?: "left" | "right" | "center";
  renderCell?: (row: Equipment) => React.ReactNode;
}