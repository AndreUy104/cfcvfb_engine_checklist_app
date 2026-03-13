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