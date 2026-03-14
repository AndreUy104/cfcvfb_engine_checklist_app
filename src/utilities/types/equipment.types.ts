export type PowerToolStatus = "OK" | "In Repair" | "Down";
 
export interface PowerTool {
  id: string;
  name: string;
  lastChecked: string;
  status: PowerToolStatus;
}

export interface PowerToolColumn {
  key: keyof PowerTool | "actions";
  label: string;
  align?: "left" | "center" | "right";
  labelSuffix?: React.ReactNode;
  renderCell: (row: PowerTool) => React.ReactNode;
}

export interface PowerToolCheckFormData {
  toolId: string;
  running: boolean;
  fuel: string;
  remarks: string;
}
 
export interface Equipment {
  id: number | string;
  name: string;
  total: number;
  inService: number;
  down: number;
  isPowerTool?: boolean;
}

export interface EquipmentColumn {
  key: keyof Equipment | "actions";
  label: string;
  labelSuffix?: React.ReactNode;
  align?: "left" | "right" | "center";
  renderCell?: (row: Equipment) => React.ReactNode;
}

export interface EquipmentFormData {
  name: string;
  total: number | "";
  serviceable: number | "";
  down: number | "";
  isPowerTool: boolean;
}