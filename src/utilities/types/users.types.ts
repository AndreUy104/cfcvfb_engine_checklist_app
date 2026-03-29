import { Tables } from "./database";

export type UserRow = Tables<"Users">;
export type PositionRow = Tables<"Positions">;
export type InspectionRow = Tables<"Inspections">;
export interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  isFirstLogin?: boolean;
}

export interface UserWithPosition extends UserRow {
  Positions: PositionRow | null;
}

export interface InspectionWithEngine extends InspectionRow {
  Engines: {
    id: number;
    name: string | null;
    plate_number: string | null;
  } | null;
}
