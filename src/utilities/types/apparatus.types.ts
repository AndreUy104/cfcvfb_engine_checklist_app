export interface Apparatus {
  id: number;
  name: string;
  type: ApparatusType | "";
  waterCapacity: string;
  licensePlate: string;
}

export type ApparatusType = "Fighting" | "Tanker";


export interface ApparatusFormData {
  name: string;
  type: ApparatusType | "";
  waterCapacity: string;
  licensePlate: string;
}