import { mockFetch } from './api';
import { DMSMessage } from '../types';

let dmsData: DMSMessage[] | null = null;

function normalizeDms(raw: any): DMSMessage {
  const priorityMap: Record<string, number> = { high: 1, medium: 2, low: 3 };
  return {
    id: raw.id,
    signId: raw.signId ?? raw.id,
    location: raw.location ?? { latitude: raw.lat, longitude: raw.lng },
    message: raw.message ?? raw.messageEn ?? '',
    messageAr: raw.messageAr ?? '',
    status: raw.isActive === false ? 'inactive' : raw.status ?? 'active',
    priority: typeof raw.priority === 'number' ? raw.priority : (priorityMap[raw.priority] ?? 2),
    startTime: raw.startTime,
    endTime: raw.endTime,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

async function getData() {
  if (!dmsData) {
    const raw = require('../mocks/dmsMessages.json');
    const arr = Array.isArray(raw) ? raw : raw.dmsMessages ?? [];
    dmsData = arr.map(normalizeDms);
  }
  return dmsData!;
}

export async function getActiveDmsMessages(): Promise<DMSMessage[]> {
  const data = await getData();
  return mockFetch(data.filter((d) => d.status === 'active'));
}

export async function getDmsById(id: string): Promise<DMSMessage | undefined> {
  const data = await getData();
  return mockFetch(data.find((d) => d.id === id));
}

export async function getDmsByType(type: string): Promise<DMSMessage[]> {
  const data = await getData();
  return mockFetch(type === 'all' ? data : data.filter((d) => (d as any).messageType === type));
}
