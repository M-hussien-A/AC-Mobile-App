import { create } from 'zustand';
import { Intersection, RoadSegment, Incident, DMSMessage } from '../types';

interface TrafficState {
  intersections: Intersection[];
  roadSegments: RoadSegment[];
  incidents: Incident[];
  dmsMessages: DMSMessage[];
  isLoading: boolean;
  error: string | null;
  activeLayers: string[];
  setIntersections: (data: Intersection[]) => void;
  setRoadSegments: (data: RoadSegment[]) => void;
  setIncidents: (data: Incident[]) => void;
  setDmsMessages: (data: DMSMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleLayer: (layer: string) => void;
  setActiveLayers: (layers: string[]) => void;
}

export const useTrafficStore = create<TrafficState>((set) => ({
  intersections: [],
  roadSegments: [],
  incidents: [],
  dmsMessages: [],
  isLoading: false,
  error: null,
  activeLayers: ['trafficFlow', 'incidents'],
  setIntersections: (data) => set({ intersections: data }),
  setRoadSegments: (data) => set({ roadSegments: data }),
  setIncidents: (data) => set({ incidents: data }),
  setDmsMessages: (data) => set({ dmsMessages: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  toggleLayer: (layer) =>
    set((state) => ({
      activeLayers: state.activeLayers.includes(layer)
        ? state.activeLayers.filter((l) => l !== layer)
        : [...state.activeLayers, layer],
    })),
  setActiveLayers: (layers) => set({ activeLayers: layers }),
}));
