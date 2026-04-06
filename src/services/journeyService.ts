import { mockFetch } from './api';
import { TripPlan, Route, RouteStep, SavedRoute, TravelMode, RouteStepManeuver } from '../types';

let journeyData: any = null;

async function getData() {
  if (!journeyData) {
    journeyData = require('../mocks/journeyPlans.json');
  }
  return journeyData;
}

// ── Map raw JSON mode strings to TravelMode ──────────────────
function mapMode(raw: string): TravelMode {
  const modeMap: Record<string, TravelMode> = {
    drive: 'driving',
    driving: 'driving',
    transit: 'transit',
    bus: 'transit',
    lrt: 'transit',
    monorail: 'transit',
    walk: 'walking',
    walking: 'walking',
    cycle: 'cycling',
    cycling: 'cycling',
    multimodal: 'multimodal',
  };
  return modeMap[raw] || 'driving';
}

// ── Map raw step mode to a maneuver ─────────────────────────
function inferManeuver(instruction: string, mode: string): RouteStepManeuver {
  const lower = instruction.toLowerCase();
  if (lower.includes('head') || lower.includes('depart')) return 'depart';
  if (lower.includes('arrive') || lower.includes('destination')) return 'arrive';
  if (lower.includes('turn right') || lower.includes('انعطف يمين')) return 'turn_right';
  if (lower.includes('turn left') || lower.includes('انعطف يسار')) return 'turn_left';
  if (lower.includes('merge')) return 'merge';
  if (lower.includes('exit') || lower.includes('take exit')) return 'exit';
  if (lower.includes('walk') || lower.includes('امش')) return 'walk';
  if (lower.includes('take') || lower.includes('board') || lower.includes('استقل')) return 'board';
  return 'straight';
}

// ── Transform raw JSON step into RouteStep ──────────────────
function transformStep(raw: any): RouteStep {
  const mode = mapMode(raw.mode || 'driving');
  return {
    instruction: raw.instruction || '',
    instructionAr: raw.instructionAr || raw.instruction || '',
    distance: (raw.distanceKm || 0) * 1000,
    duration: (raw.durationMin || 0) * 60,
    mode,
    maneuver: inferManeuver(raw.instruction || '', raw.mode || ''),
    polyline: '',
    startLocation: { latitude: 0, longitude: 0 },
    endLocation: { latitude: 0, longitude: 0 },
    transitDetails: raw.transitInfo
      ? {
          routeId: raw.transitInfo.routeNumber || '',
          routeName: raw.transitInfo.routeNumber || '',
          departureStation: raw.transitInfo.boardStation || '',
          arrivalStation: raw.transitInfo.alightStation || '',
          departureTime: '',
          arrivalTime: '',
          numStops: 0,
        }
      : undefined,
  };
}

// ── Transform raw JSON route into Route ─────────────────────
function transformRoute(raw: any): Route {
  const durationSec = (raw.durationMin || 0) * 60;
  const delaySec = (raw.delayMin || 0) * 60;
  const steps = (raw.steps || []).map(transformStep);
  return {
    id: raw.id || `route-${Math.random().toString(36).slice(2, 8)}`,
    mode: mapMode(raw.mode || 'drive'),
    distance: (raw.distanceKm || 0) * 1000,
    duration: durationSec,
    durationInTraffic: durationSec + delaySec,
    polyline: JSON.stringify(raw.polyline || []),
    steps,
    fare: raw.fareEGP || undefined,
    currency: raw.fareEGP ? 'EGP' : undefined,
    carbonEmission: raw.co2Grams || 0,
    tolls: 0,
  };
}

// ── Transform raw JSON plan into TripPlan ───────────────────
function transformPlan(
  raw: any,
  from: { lat: number; lng: number; name: string },
  to: { lat: number; lng: number; name: string },
  mode: TravelMode,
): TripPlan {
  const routes = (raw.routes || []).map(transformRoute);
  return {
    id: raw.id || `plan-${Math.random().toString(36).slice(2, 8)}`,
    origin: { latitude: from.lat, longitude: from.lng },
    originName: from.name,
    destination: { latitude: to.lat, longitude: to.lng },
    destinationName: to.name,
    departureTime: new Date().toISOString(),
    arrivalTime: new Date(Date.now() + (routes[0]?.durationInTraffic || 0) * 1000).toISOString(),
    routes,
    preferredMode: mode,
    createdAt: new Date().toISOString(),
  };
}

export async function planTrip(
  from: { lat: number; lng: number; name: string },
  to: { lat: number; lng: number; name: string },
  mode: string,
  options?: { avoidTolls?: boolean; avoidHighways?: boolean; avoidWorkZones?: boolean }
): Promise<TripPlan> {
  const data = await getData();
  const plans = data.plans || data;
  const rawPlan = Array.isArray(plans) ? plans[0] : plans;
  const travelMode = mapMode(mode);
  const transformed = transformPlan(rawPlan, from, to, travelMode);
  return mockFetch(transformed, 800);
}

// ── Transform raw saved route JSON into SavedRoute ──────────
function transformSavedRoute(raw: any): SavedRoute {
  return {
    id: raw.id || '',
    userId: 'user-001',
    name: raw.name || '',
    origin: { latitude: raw.from?.lat || 0, longitude: raw.from?.lng || 0 },
    originName: raw.from?.name || '',
    destination: { latitude: raw.to?.lat || 0, longitude: raw.to?.lng || 0 },
    destinationName: raw.to?.name || '',
    preferredMode: 'driving',
    waypoints: [],
    isFavorite: true,
    lastUsed: raw.lastUsed || new Date().toISOString(),
    createdAt: raw.lastUsed || new Date().toISOString(),
    // Preserve raw fields for display convenience
    ...(raw.estimatedTimeMin != null ? { _estimatedTimeMin: raw.estimatedTimeMin } : {}),
  };
}

export async function getSavedRoutes(): Promise<SavedRoute[]> {
  const data = await getData();
  const rawRoutes = data.savedRoutes || [];
  return mockFetch(rawRoutes.map(transformSavedRoute));
}

export async function saveRoute(route: SavedRoute): Promise<void> {
  await mockFetch(null, 300);
}

export async function deleteSavedRoute(id: string): Promise<void> {
  await mockFetch(null, 300);
}
