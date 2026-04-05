import { mockFetch } from './api';
import { Intersection, RoadSegment, LatLng, LOSGrade, SignalPhase } from '../types';

let trafficData: any = null;

async function getTrafficData() {
  if (!trafficData) {
    trafficData = require('../mocks/traffic.json');
  }
  return trafficData;
}

// ── Normalizers ──────────────────────────────────────────────

/**
 * Derive a synthetic signal phase from the mock's signalStatus / LOS.
 * The mock JSON only has "signalStatus" (e.g. "normal", "degraded") and no
 * direct signalPhase, so we synthesise one from LOS grade.
 */
function deriveSignalPhase(raw: any): SignalPhase {
  if (raw.signalStatus === 'degraded' || raw.signalStatus === 'fault') {
    return 'flashing';
  }
  const los: string = raw.los;
  if (los === 'E' || los === 'F') return 'red';
  if (los === 'D') return 'yellow';
  return 'green';
}

/**
 * Convert a raw mock intersection object to the TypeScript Intersection type.
 *
 * Mock fields → TS fields:
 *   lat, lng           → location: { latitude, longitude }
 *   (derived)          → signalPhase
 *   speedLimitKmh (N/A)→ speedLimit  (default 60)
 *   speedKmh (N/A)     → avgSpeed    (derived from LOS)
 *   queueLength        → volume      (best available proxy)
 *   (derived)          → occupancy   (from queueLength / cycleTime)
 *   lastUpdated        → updatedAt
 */
function normalizeIntersection(raw: any): Intersection {
  const losSpeedMap: Record<string, number> = {
    A: 55, B: 45, C: 35, D: 25, E: 15, F: 8,
  };

  return {
    id: raw.id,
    name: raw.name,
    nameAr: raw.nameAr,
    location: {
      latitude: raw.lat,
      longitude: raw.lng,
    },
    los: raw.los as LOSGrade,
    signalPhase: deriveSignalPhase(raw),
    countdown: undefined,
    speedLimit: 60,
    avgSpeed: losSpeedMap[raw.los] ?? 30,
    volume: raw.queueLength ?? 0,
    occupancy: raw.cycleTime
      ? Math.min(Math.round(((raw.queueLength ?? 0) / raw.cycleTime) * 100), 100)
      : 0,
    updatedAt: raw.lastUpdated,
  };
}

/**
 * Convert a [lat, lng] coordinate pair to a LatLng object.
 */
function toLatLng(coord: [number, number]): LatLng {
  return { latitude: coord[0], longitude: coord[1] };
}

/**
 * Estimate segment length in km from coordinates using the Haversine formula.
 */
function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Convert a raw mock road-segment object to the TypeScript RoadSegment type.
 *
 * Mock fields → TS fields:
 *   coordinates[0]      → startPoint
 *   coordinates[last]   → endPoint
 *   coordinates[1..-2]  → waypoints
 *   speedKmh            → avgSpeed
 *   speedLimitKmh       → speedLimit
 *   travelTimeMin       → travelTime
 *   (computed)          → length  (haversine from start to end through waypoints)
 *   (default 3)         → lanes
 *   (now())             → updatedAt
 */
function normalizeRoadSegment(raw: any): RoadSegment {
  const coords: [number, number][] = raw.coordinates ?? [];
  const points = coords.map(toLatLng);
  const startPoint = points[0] ?? { latitude: 0, longitude: 0 };
  const endPoint = points[points.length - 1] ?? startPoint;
  const waypoints = points.length > 2 ? points.slice(1, -1) : [];

  // Compute polyline length in km
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += haversineKm(points[i - 1], points[i]);
  }

  return {
    id: raw.id,
    name: raw.name,
    nameAr: raw.nameAr,
    startPoint,
    endPoint,
    waypoints,
    los: raw.los as LOSGrade,
    speedLimit: raw.speedLimitKmh ?? 60,
    avgSpeed: raw.speedKmh ?? 0,
    travelTime: raw.travelTimeMin ?? 0,
    length: Math.round(length * 100) / 100,
    lanes: raw.lanes ?? 3,
    updatedAt: raw.lastUpdated ?? new Date().toISOString(),
  };
}

// ── Public API ────────────────────────────────────────────────

export async function getIntersections(): Promise<Intersection[]> {
  const data = await getTrafficData();
  const raw = Array.isArray(data) ? data : data.intersections ?? [];
  return mockFetch(raw.map(normalizeIntersection));
}

export async function getRoadSegments(): Promise<RoadSegment[]> {
  const data = await getTrafficData();
  const raw = Array.isArray(data) ? [] : data.roadSegments ?? [];
  return mockFetch(raw.map(normalizeRoadSegment));
}

export async function getIntersectionById(id: string): Promise<Intersection | undefined> {
  const data = await getTrafficData();
  const raw = Array.isArray(data) ? data : data.intersections ?? [];
  const found = raw.find((i: any) => i.id === id);
  return mockFetch(found ? normalizeIntersection(found) : undefined);
}

export async function getMapData() {
  const data = await getTrafficData();
  const rawIntersections = Array.isArray(data) ? data : data.intersections ?? [];
  const rawSegments = Array.isArray(data) ? [] : data.roadSegments ?? [];
  return mockFetch({
    intersections: rawIntersections.map(normalizeIntersection),
    roadSegments: rawSegments.map(normalizeRoadSegment),
  });
}
