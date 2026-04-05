import { mockFetch } from './api';
import { Alert } from '../types';

let alertData: Alert[] | null = null;

async function getData() {
  if (!alertData) {
    alertData = require('../mocks/alerts.json');
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
  return mockFetch(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
}

export async function getAlertById(id: string): Promise<Alert | undefined> {
  const data = await getData();
  return mockFetch(data.find((a) => a.id === id));
}

export async function markAlertRead(id: string): Promise<void> {
  await mockFetch(null, 200);
}
