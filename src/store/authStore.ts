import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  fullName: string;
  nin: string;
  phone: string;
  walletBalance: number;
  email?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (nin: string, password: string) => Promise<boolean>;
  register: (data: {
    fullName: string;
    nin: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateBalance: (amount: number) => void;
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
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (nin: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const user = mockUsers[nin];
        if (user && user.password === password) {
          const { password: _, ...userData } = user;
          set({ user: userData, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      register: async (data) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        if (mockUsers[data.nin]) {
          return false; // User already exists
        }
        
        const newUser: User = {
          id: Date.now().toString(),
          fullName: data.fullName,
          nin: data.nin,
          phone: data.phone,
          walletBalance: 0,
        };
        
        mockUsers[data.nin] = { ...newUser, password: data.password };
        set({ user: newUser, isAuthenticated: true });
        return true;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
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
    }
  )
);
