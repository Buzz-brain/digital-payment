import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiFetch from '@/lib/api';

interface User {
  id: string;
  username?: string;
  fullName: string;
  nin: string;
  phone: string;
  walletBalance: number;
  email?: string;
  wallet?: {
    balance: number;
    ledger?: Array<any>;
  };
  ninInfo?: Record<string, any> | null;
}

interface AuthState {
  user: User | null;
  wallet?: { balance: number; ledger?: Array<any> } | null;
  initializing?: boolean;
  isAuthenticated: boolean;
  token?: string;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (data: {
    username?: string;
    fullName?: string;
    nin: string;
    phone?: string;
    password: string;
    role?: string;
  }) => Promise<boolean>;
  logout: (redirectTo?: string) => Promise<void>;
  updateBalance: (amount: number) => void;
  fetchCurrentUser: () => Promise<void>;
  getProfile: () => Promise<void>;
  updateProfile: (data: { fullName?: string; email?: string; phone?: string; username?: string }) => Promise<void>;
}

// Mock user data
const mockUsers: Record<string, User & { password: string }> = {
  '12345678901': {
    id: '1',
    fullName: 'Adebayo Johnson',
    nin: '12345678901',
    phone: '08012345678',
    password: 'password123',
    walletBalance: 25000,
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      wallet: null,
      initializing: false,
      isAuthenticated: false,
      
      // Helper to normalize user response: prefer `ninInfo` fields when present
      _formatUserResp: (userResp: any, walletBalance = 0) => {
        const nin = userResp?.ninInfo || null;
        return {
          id: userResp._id || userResp.id,
          username: userResp.username,
          fullName: (nin && nin.fullName) || userResp.fullName || userResp.username || '',
          nin: userResp.nin,
          phone: (nin && nin.phone) || userResp.phone || '',
          walletBalance: walletBalance || 0,
          email: (nin && nin.email) || userResp.email || undefined,
          wallet: undefined,
          // Preserve raw ninInfo object so consumer components can read demographic fields
          ninInfo: userResp.ninInfo || null,
        } as any;
      },

      login: async (identifier: string, password: string) => {
        // Try backend login first
        try {
          const payload: any = { password };
          // send as nin when identifier matches 11 digits, otherwise as username
          if (/^\d{11}$/.test(identifier)) payload.nin = identifier;
          else payload.username = identifier;

          const res: any = await apiFetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const userResp = res.user || res;
          const formatted = get()._formatUserResp(userResp, userResp.walletBalance || 0);
          set({ user: formatted, isAuthenticated: true, token: res.token });
          return true;
        } catch (err: any) {
          // If it's an HTTP error from server (e.g., invalid credentials), rethrow so UI can show message
          if (err && typeof err === 'object' && 'status' in err) throw err;

          // Fallback to mock behaviour for offline/dev
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const user = mockUsers[identifier];
          if (user && user.password === password) {
            const { password: _, ...userData } = user;
            set({ user: userData, isAuthenticated: true });
            return true;
          }
          return false;
        }
      },
      
      register: async (data) => {
        // Try real backend registration first
        try {
          const payload = {
            username: data.username,
            nin: data.nin,
            password: data.password,
            role: data.role,
          };
          const res: any = await apiFetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          // Expecting { user, token }
          const userResp = res.user || res;
          const formatted = get()._formatUserResp(userResp, userResp.walletBalance || 0);
          set({ user: formatted, isAuthenticated: true, token: res.token });
          return true;
        } catch (err: any) {
          // If server returned an HTTP error (validation like NIN not found), rethrow
          if (err && typeof err === 'object' && 'status' in err) {
            throw err;
          }
          // Otherwise treat as network/offline and fall back to local mock behaviour
          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (mockUsers[data.nin]) {
            return false;
          }
          const displayName = data.fullName || data.username || 'User';
          const newUser: User = {
            id: Date.now().toString(),
            fullName: displayName,
            nin: data.nin,
            phone: data.phone || '',
            walletBalance: 0,
          };
          mockUsers[data.nin] = { ...newUser, password: data.password };
          set({ user: newUser, isAuthenticated: true });
          return true;
        }
      },
      fetchCurrentUser: (() => {
        // Guard to prevent concurrent/duplicate calls and rapid repeats
        let inFlight: Promise<void> | null = null;
        let lastFetchAt = 0;
        const COOLDOWN_MS = 1500; // do not refetch more often than this
        return async () => {
          const now = Date.now();
          if (inFlight) return inFlight;
          if (now - lastFetchAt < COOLDOWN_MS) {
            // short-circuit repeated rapid calls
            return Promise.resolve();
          }
          lastFetchAt = now;
          const p = (async () => {
            set({ initializing: true });
            try {
              // helpful debug if needed
              // console.debug('fetchCurrentUser: sending /api/auth/me');
              const res: any = await apiFetch('/api/auth/me', { method: 'GET' });
              const userResp = res.user || res;
              const wallet = res.wallet || null;
              const formatted = get()._formatUserResp(userResp, wallet?.balance || 0);
              set({ user: { ...formatted, wallet: wallet ? { balance: wallet.balance || 0, ledger: wallet.ledger || [] } : undefined }, wallet: wallet ? { balance: wallet.balance || 0, ledger: wallet.ledger || [] } : null, isAuthenticated: true });
            } catch (e) {
              // Couldn't fetch current user — ensure client is logged out
              set({ user: null, wallet: null, isAuthenticated: false, token: undefined });
              try { localStorage.removeItem('dpi-auth'); } catch (_) {}
            } finally {
              set({ initializing: false });
              inFlight = null;
            }
          })();
          inFlight = p;
          return p;
        };
      })(),

      // Fetch profile via dedicated user endpoint and update store.user
      getProfile: async () => {
        try {
          const res: any = await apiFetch('/api/user/profile', { method: 'GET' });
          const userResp = res || {};
          const formatted = get()._formatUserResp(userResp, get().user?.walletBalance || 0);
          set((state) => ({ user: { ...(state.user || {}), ...formatted } }));
        } catch (e) {
          // ignore or clear store on error
        }
      },

      updateProfile: async (data) => {
        try {
          const res: any = await apiFetch('/api/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          const userResp = res || {};
          const formatted = get()._formatUserResp(userResp, get().user?.walletBalance || 0);
          set((state) => ({ user: formatted, isAuthenticated: true }));
        } catch (e) {
          throw e;
        }
      },
      
      logout: async (redirectTo: string = '/login') => {
        // Perform backend logout (best-effort) to blacklist token, then always clear client state
        try {
          await apiFetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
          // swallow network errors — still proceed to clear client state
        }

        // Clear persisted zustand entry and in-memory state
        try {
          localStorage.removeItem('dpi-auth');
        } catch (e) {
          // ignore
        }
        set({ user: null, isAuthenticated: false, token: undefined });

        // Redirect to provided path (default: /login)
        try {
          window.location.href = redirectTo;
        } catch (e) {
          // ignore in non-browser environments
        }
      },
      
      updateBalance: (amount: number) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, walletBalance: state.user.walletBalance + amount }
            : null,
        }));
      },
    }),
    {
      name: 'dpi-auth',
      // Do not persist transient flags like `initializing`
      partialize: (state) => ({ user: state.user, wallet: state.wallet, isAuthenticated: state.isAuthenticated, token: state.token }),
    }
  )
);
