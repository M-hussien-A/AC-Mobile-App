import { create } from 'zustand';
import { ParkingFacility, ParkingSession } from '../types';

interface ParkingState {
  facilities: ParkingFacility[];
  selectedFacility: ParkingFacility | null;
  activeSession: ParkingSession | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    type: string | null;
    hasEVCharging: boolean;
    hasDisabledAccess: boolean;
    maxPricePerHour: number | null;
  };
  setFacilities: (data: ParkingFacility[]) => void;
  setSelectedFacility: (facility: ParkingFacility | null) => void;
  setActiveSession: (session: ParkingSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateFilter: (key: string, value: any) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  type: null,
  hasEVCharging: false,
  hasDisabledAccess: false,
  maxPricePerHour: null,
};

export const useParkingStore = create<ParkingState>((set) => ({
  facilities: [],
  selectedFacility: null,
  activeSession: null,
  isLoading: false,
  error: null,
  filters: { ...defaultFilters },
  setFacilities: (data) => set({ facilities: data }),
  setSelectedFacility: (facility) => set({ selectedFacility: facility }),
  setActiveSession: (session) => set({ activeSession: session }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  updateFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
}));
