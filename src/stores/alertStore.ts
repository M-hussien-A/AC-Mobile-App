import { create } from 'zustand';
import { Alert } from '../types';

interface AlertState {
  alerts: Alert[];
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
  setAlerts: (data: Alert[]) => void;
  markAsRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  setCategory: (category: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getUnreadCount: () => number;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  selectedCategory: 'all',
  isLoading: false,
  error: null,
  setAlerts: (data) => set({ alerts: data }),
  markAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    })),
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),
  setCategory: (category) => set({ selectedCategory: category }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  getUnreadCount: () => get().alerts.filter((a) => !a.isRead).length,
}));
