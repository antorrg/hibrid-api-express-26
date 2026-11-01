import type { UserRole } from '../../../Auth/types';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  nickname: string;
  picture: string;
  enabled: boolean;
}

export interface CreateUserPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
}

export interface ChangePasswordPayload {
  id: string;
  password: string;
  newPassword: string;
}

export interface UpgradeUserPayload {
  role: UserRole | string;
  enabled: boolean;
}

export const roleTranslate = (role?: string): string => {
  switch (role) {
    case 'OWNER':
      return 'Propietario';
    case 'ADMIN':
      return 'Administrador';
    case 'USER':
      return 'Usuario';
    default:
      return role || 'Usuario';
  }
};
