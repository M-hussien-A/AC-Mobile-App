import { create } from 'zustand';
import { UserProfile, Violation } from '../types';

interface Transaction {
  id: string;
  type: 'parking' | 'transit' | 'fine' | 'topUp';
  description: string;
  descriptionAr: string;
  amountEGP: number;
  date: string;
}

interface UserState {
  profile: UserProfile | null;
  violations: Violation[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: UserProfile) => void;
  updateWalletBalance: (amount: number) => void;
  setViolations: (data: Violation[]) => void;
  setTransactions: (data: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  violations: [],
  transactions: [],
  isLoading: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  updateWalletBalance: (amount) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, walletBalanceEGP: state.profile.walletBalanceEGP + amount }
        : null,
    })),
  setViolations: (data) => set({ violations: data }),
  setTransactions: (data) => set({ transactions: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
