import { mockFetch } from './api';
import { TransitRoute, TransitStation } from '../types';

let transitData: TransitRoute[] | null = null;

function normalizeStation(raw: any): TransitStation {
  return {
    id: raw.id,
    name: raw.name,
    nameAr: raw.nameAr,
    location: raw.location ?? { latitude: raw.lat, longitude: raw.lng },
    routeIds: raw.routeIds ?? [],
    amenities: raw.amenities ?? raw.facilities ?? [],
    isAccessible: raw.isAccessible ?? (raw.facilities ?? []).some((f: string) => f.includes('wheelchair')),
    nextArrivals: Array.isArray(raw.nextArrivals) && typeof raw.nextArrivals[0] === 'string'
      ? raw.nextArrivals.map((t: string, i: number) => ({
          routeId: '',
          routeName: '',
          destination: '',
          estimatedArrival: t,
          delayMinutes: 0,
        }))
      : raw.nextArrivals ?? [],
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeRoute(raw: any): TransitRoute {
  const freqMatch = typeof raw.frequency === 'string' ? raw.frequency.match(/(\d+)/) : null;
  const freqNum = freqMatch ? parseInt(freqMatch[1], 10) : (typeof raw.frequency === 'number' ? raw.frequency : 10);
  const modeMap: Record<string, string> = { lrt: 'metro', monorail: 'tram' };
  return {
    id: raw.id,
    name: raw.name,
    nameAr: raw.nameAr,
    shortName: raw.shortName ?? raw.id,
    mode: modeMap[raw.type] ?? raw.mode ?? raw.type ?? 'bus',
    color: raw.color ?? '#1F4E79',
    stations: (raw.stations ?? []).map(normalizeStation),
    frequency: freqNum,
    operatingHours: raw.operatingHours ?? '06:00 - 22:00',
    fare: raw.fare ?? raw.fareEGP ?? 10,
    currency: raw.currency ?? 'EGP',
    isActive: raw.isActive ?? true,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

async function getData() {
  if (!transitData) {
    const raw = require('../mocks/transitRoutes.json');
    const arr = Array.isArray(raw) ? raw : raw.transitRoutes ?? [];
    transitData = arr.map(normalizeRoute);
  }
  return transitData!;
}

export async function getTransitRoutes(): Promise<TransitRoute[]> {
  const data = await getData();
  return mockFetch(data);
}

export async function getRouteById(id: string): Promise<TransitRoute | undefined> {
  const data = await getData();
  return mockFetch(data.find((r) => r.id === id));
}

export async function getRoutesByMode(mode: string): Promise<TransitRoute[]> {
  const data = await getData();
  return mockFetch(mode === 'all' ? data : data.filter((r) => r.mode === mode));
}

export async function purchaseFare(
  fromStationId: string,
  toStationId: string
): Promise<{ ticketId: string; fare: number; qrCode: string; validUntil: string }> {
  return mockFetch({
    ticketId: `TKT-${Date.now()}`,
    fare: 15,
    qrCode: `TRANSIT-QR-${Date.now()}`,
    validUntil: new Date(Date.now() + 2 * 3600000).toISOString(),
  });
}
