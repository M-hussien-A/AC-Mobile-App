import { mockFetch } from './api';
import { Alert } from '../types';

let alertData: Alert[] | null = null;

function normalizeAlert(raw: any): Alert {
  return {
    id: raw.id,
    category: raw.category,
    severity: raw.severity === 'warning' ? 'major' : raw.severity,
    title: raw.title,
    titleAr: raw.titleAr,
    message: raw.message ?? raw.description ?? '',
    messageAr: raw.messageAr ?? raw.descriptionAr ?? '',
    location: raw.location ?? (raw.lat != null ? { latitude: raw.lat, longitude: raw.lng } : undefined),
    radius: raw.radius,
    startTime: raw.startTime,
    endTime: raw.endTime,
    isRead: raw.isRead ?? raw.read ?? false,
    actionUrl: raw.actionUrl,
    createdAt: raw.createdAt ?? raw.lastUpdated ?? raw.startTime,
  };
}

async function getData() {
  if (!alertData) {
    const raw = require('../mocks/alerts.json');
    const arr = Array.isArray(raw) ? raw : raw.alerts ?? [];
    alertData = arr.map(normalizeAlert);
  }
  return alertData!;
}

export async function getAlerts(
  category?: string,
  severity?: string
): Promise<Alert[]> {
  let data = await getData();
  if (category && category !== 'all') {
    data = data.filter((a) => a.category === category);
  }
  if (severity && severity !== 'all') {
    data = data.filter((a) => a.severity === severity);
  }
  return mockFetch(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

export async function getAlertById(id: string): Promise<Alert | undefined> {
  const data = await getData();
  return mockFetch(data.find((a) => a.id === id));
}

export async function markAlertRead(id: string): Promise<void> {
  await mockFetch(null, 200);
}
