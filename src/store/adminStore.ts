import { create } from 'zustand';
import { AdminRole } from '@/lib/rbac';
import { useAuthStore } from './authStore';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
}

interface AdminAuthState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mock admin accounts with different roles
// NOTE: In production, roles should be validated server-side
const mockAdmins: Record<string, { password: string; user: AdminUser }> = {
  'adminuser': {
    password: 'adminpass',
    user: {
      id: 'ADM001',
      fullName: 'Super Admin',
      email: 'adminuser',
      role: 'super_admin',
    },
  },
  'moderator': {
    password: 'mod123',
    user: {
      id: 'ADM002',
      fullName: 'Moderator User',
      email: 'moderator',
      role: 'moderator',
    },
  },
  'viewer': {
    password: 'view123',
    user: {
      id: 'ADM003',
      fullName: 'Viewer User',
      email: 'viewer',
      role: 'viewer',
    },
  },
};

export const useAdminStore = create<AdminAuthState>()((set) => ({
  admin: null,
  isAuthenticated: false,
  login: async (username: string, password: string) => {
    // Delegate authentication to the main auth store so tokens and session persist under `dpi-auth`
    try {
      const authLogin = useAuthStore.getState().login;
      const success = await authLogin(username, password);
      if (success) {
        const user = useAuthStore.getState().user;
        set({ admin: { id: user?.id || '', fullName: user?.fullName || '', email: user?.username || user?.email || '', role: (user as any)?.role || 'viewer' as AdminRole }, isAuthenticated: true });
        return true;
      }
    } catch (err: any) {
      // rethrow HTTP errors so UI can display them
      if (err && typeof err === 'object' && 'status' in err) throw err;
    }

    // Local mock fallback
    const adminData = mockAdmins[username];
    if (adminData && adminData.password === password) {
      // For mock flow we don't have a real token; still set admin in-memory
      set({ admin: adminData.user, isAuthenticated: true });
      return true;
    }

    return false;
  },
  logout: () => {
    // Log out via main auth store to clear `dpi-auth`
    try {
      useAuthStore.getState().logout('/admin/login');
    } catch (e) {
      // ignore
    }
    set({ admin: null, isAuthenticated: false });
  },
}));
