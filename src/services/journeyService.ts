import { mockFetch } from './api';
import { TripPlan, SavedRoute } from '../types';

let journeyData: any = null;

async function getData() {
  if (!journeyData) {
    journeyData = require('../mocks/journeyPlans.json');
  }
  return journeyData;
}

export async function planTrip(
  from: { lat: number; lng: number; name: string },
  to: { lat: number; lng: number; name: string },
  mode: string,
  options?: { avoidTolls?: boolean; avoidHighways?: boolean; avoidWorkZones?: boolean }
): Promise<TripPlan> {
  const data = await getData();
  const plans = data.plans || data;
  return mockFetch(Array.isArray(plans) ? plans[0] : plans, 800);
}

export async function getSavedRoutes(): Promise<SavedRoute[]> {
  const data = await getData();
  return mockFetch(data.savedRoutes || []);
}

export async function saveRoute(route: SavedRoute): Promise<void> {
  await mockFetch(null, 300);
}

export async function deleteSavedRoute(id: string): Promise<void> {
  await mockFetch(null, 300);
}
