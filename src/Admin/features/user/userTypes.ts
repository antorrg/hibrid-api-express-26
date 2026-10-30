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

export interface UpdateProfilePayload {
  name?: string;
  nickname?: string;
  picture?: string;
}
