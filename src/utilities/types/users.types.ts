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