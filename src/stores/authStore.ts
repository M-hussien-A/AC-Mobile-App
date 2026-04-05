import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasSeenOnboarding: false,
  token: null,
  login: (token) => set({ isAuthenticated: true, token }),
  logout: () => set({ isAuthenticated: false, token: null }),
  completeOnboarding: () => set({ hasSeenOnboarding: true }),
}));
