import { create } from 'zustand';
import { TripPlan, Route, SavedRoute } from '../types';

interface JourneyState {
  currentPlan: TripPlan | null;
  selectedRoute: Route | null;
  savedRoutes: SavedRoute[];
  isNavigating: boolean;
  currentStepIndex: number;
  isLoading: boolean;
  error: string | null;
  setCurrentPlan: (plan: TripPlan | null) => void;
  setSelectedRoute: (route: Route | null) => void;
  setSavedRoutes: (routes: SavedRoute[]) => void;
  startNavigation: (route: Route) => void;
  stopNavigation: () => void;
  nextStep: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  currentPlan: null,
  selectedRoute: null,
  savedRoutes: [],
  isNavigating: false,
  currentStepIndex: 0,
  isLoading: false,
  error: null,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  setSavedRoutes: (routes) => set({ savedRoutes: routes }),
  startNavigation: (route) => set({ selectedRoute: route, isNavigating: true, currentStepIndex: 0 }),
  stopNavigation: () => set({ isNavigating: false, currentStepIndex: 0 }),
  nextStep: () => set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
