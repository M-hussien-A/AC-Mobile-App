import { mockFetch } from './api';
import { ParkingFacility, ParkingSession } from '../types';

let parkingData: ParkingFacility[] | null = null;

function normalizeFacility(raw: any): ParkingFacility {
  const avail = raw.availableSpaces ?? 0;
  const total = raw.totalSpaces ?? 0;
  const ratio = total > 0 ? avail / total : 0;
  return {
    id: raw.id,
    name: raw.name,
    nameAr: raw.nameAr,
    location: raw.location ?? { latitude: raw.lat, longitude: raw.lng },
    type: raw.type === 'onStreet' ? 'street' : raw.type === 'offStreet' ? 'garage' : raw.type === 'parkAndRide' ? 'lot' : raw.type,
    totalSpaces: total,
    availableSpaces: avail,
    availability: avail === 0 ? 'full' : ratio < 0.2 ? 'limited' : 'available',
    ratePerHour: raw.ratePerHour ?? raw.pricePerHourEGP ?? 10,
    currency: raw.currency ?? 'EGP',
    operatingHours: raw.operatingHours ?? '24/7',
    amenities: raw.amenities ?? (raw.features ?? []).map((f: string) =>
      f === 'ev-charging' ? 'ev_charging' : f === 'handicap-accessible' ? 'disabled_access' : f),
    evChargingSpaces: raw.evChargingSpaces ?? ((raw.features ?? []).includes('ev-charging') ? 5 : 0),
    disabledSpaces: raw.disabledSpaces ?? ((raw.features ?? []).includes('handicap-accessible') ? 5 : 0),
    distanceFromUser: raw.distanceFromUser,
    ratePerDay: raw.ratePerDay ?? raw.maxDailyEGP ?? (raw.ratePerHour ?? raw.pricePerHourEGP ?? 10) * 5,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  } as ParkingFacility & { ratePerDay: number };
}

async function getData() {
  if (!parkingData) {
    const raw = require('../mocks/parkingFacilities.json');
    const arr = Array.isArray(raw) ? raw : raw.parkingFacilities ?? [];
    parkingData = arr.map(normalizeFacility);
  }
  return parkingData!;
}

export async function getParkingFacilities(): Promise<ParkingFacility[]> {
  const data = await getData();
  return mockFetch(data);
}

export async function getParkingById(id: string): Promise<ParkingFacility | undefined> {
  const data = await getData();
  return mockFetch(data.find((p) => p.id === id));
}

export async function reserveParking(
  facilityId: string,
  startTime: string,
  durationHours: number,
  vehiclePlate: string
): Promise<{ reservationId: string; amount: number }> {
  const data = await getData();
  const facility = data.find((p) => p.id === facilityId);
  const amount = ((facility as any)?.ratePerHour ?? 10) * durationHours;
  return mockFetch({ reservationId: `RES-${Date.now()}`, amount });
}

export async function getActiveSession(): Promise<ParkingSession | null> {
  return mockFetch({
    id: 'SESSION-001',
    facilityId: 'PKG-001',
    facilityName: 'Government District Garage A',
    startTime: new Date(Date.now() - 45 * 60000).toISOString(),
    endTime: null,
    vehiclePlate: 'ABC 1234',
    status: 'active' as const,
    amountEGP: 15,
    qrCode: 'MOCK-QR-SESSION-001',
  });
}

export async function endSession(sessionId: string): Promise<{ finalAmount: number }> {
  return mockFetch({ finalAmount: 25 });
}

export async function extendSession(
  sessionId: string,
  additionalHours: number
): Promise<{ newEndTime: string; additionalAmount: number }> {
  return mockFetch({
    newEndTime: new Date(Date.now() + additionalHours * 3600000).toISOString(),
    additionalAmount: additionalHours * 10,
  });
}
