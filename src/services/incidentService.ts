import { mockFetch } from './api';
import { Incident } from '../types';

let incidentData: Incident[] | null = null;

function normalizeIncident(raw: any): Incident {
  return {
    id: raw.id,
    type: raw.type,
    severity: raw.severity,
    title: raw.title,
    titleAr: raw.titleAr,
    description: raw.description ?? raw.descriptionEn ?? '',
    descriptionAr: raw.descriptionAr ?? '',
    location: raw.location ?? { latitude: raw.lat, longitude: raw.lng },
    affectedRoadSegments: raw.affectedRoadSegments ?? [],
    startTime: raw.startTime,
    endTime: raw.endTime,
    estimatedClearTime: raw.estimatedClearTime,
    verified: raw.verified ?? (raw.status === 'confirmed' || raw.status === 'responding'),
    source: raw.source ?? 'TMC',
    updatedAt: raw.updatedAt ?? raw.lastUpdated ?? new Date().toISOString(),
  };
}

async function getData() {
  if (!incidentData) {
    const raw = require('../mocks/incidents.json');
    const arr = Array.isArray(raw) ? raw : raw.incidents ?? [];
    incidentData = arr.map(normalizeIncident);
  }
  return incidentData!;
}

export async function getActiveIncidents(): Promise<Incident[]> {
  const data = await getData();
  return mockFetch(data.filter((i) => i.endTime == null || new Date(i.endTime) > new Date()));
}

export async function getIncidentById(id: string): Promise<Incident | undefined> {
  const data = await getData();
  return mockFetch(data.find((i) => i.id === id));
}

export async function getAllIncidents(): Promise<Incident[]> {
  const data = await getData();
  return mockFetch(data);
}
