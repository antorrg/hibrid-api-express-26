export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const RoleHierarchy: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.OWNER]: 3,
};

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  nickname?: string;
  given_name?: string;
  picture?: string;
  [key: string]: unknown;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  authenticated: boolean; // Alias de compatibilidad
  isLoading: boolean;
  login: (data: LoginCredentials | UserSession) => Promise<UserSession>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<UserSession | null>;
  hasRole: (role: UserRole) => boolean;
  hasMinRole: (minRole: UserRole) => boolean;
  canAccess: (allowedRoles: UserRole[]) => boolean;
}
