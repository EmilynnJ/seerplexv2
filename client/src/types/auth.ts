export type UserRole = 'admin' | 'reader' | 'client';

export interface UserMetadata {
  role?: UserRole;
}

export interface DashboardPaths {
  admin: string;
  reader: string;
  client: string;
}

export const DASHBOARD_PATHS: DashboardPaths = {
  admin: '/dashboard/admin',
  reader: '/dashboard/reader',
  client: '/dashboard/client',
};

export const PUBLIC_PATHS = [
  '/',
  '/about',
  '/shop',
  '/community',
  '/live',
  '/help',
  '/policies',
  '/login',
  '/signup',
  '/unauthorized'
] as const;