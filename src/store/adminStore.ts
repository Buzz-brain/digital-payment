import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AdminAuthState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAdminStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        // Mock admin credentials
        if (email === 'admin@dpi.gov' && password === 'admin123') {
          const adminUser: AdminUser = {
            id: 'ADM001',
            fullName: 'Admin User',
            email: 'admin@dpi.gov',
            role: 'Super Admin',
          };
          set({ admin: adminUser, isAuthenticated: true });
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
