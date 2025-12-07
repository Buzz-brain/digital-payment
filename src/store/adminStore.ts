import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminRole } from '@/lib/rbac';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
}

interface AdminAuthState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

// Mock admin accounts with different roles
// NOTE: In production, roles should be validated server-side via Supabase RLS
const mockAdmins: Record<string, { password: string; user: AdminUser }> = {
  'admin@dpi.gov': {
    password: 'admin123',
    user: {
      id: 'ADM001',
      fullName: 'Super Admin',
      email: 'admin@dpi.gov',
      role: 'super_admin',
    },
  },
  'moderator@dpi.gov': {
    password: 'mod123',
    user: {
      id: 'ADM002',
      fullName: 'Moderator User',
      email: 'moderator@dpi.gov',
      role: 'moderator',
    },
  },
  'viewer@dpi.gov': {
    password: 'view123',
    user: {
      id: 'ADM003',
      fullName: 'Viewer User',
      email: 'viewer@dpi.gov',
      role: 'viewer',
    },
  },
};

export const useAdminStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        const adminData = mockAdmins[email];
        if (adminData && adminData.password === password) {
          set({ admin: adminData.user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ admin: null, isAuthenticated: false });
      },
    }),
    {
      name: 'admin-storage',
    }
  )
);
