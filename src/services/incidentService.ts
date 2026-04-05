import { mockFetch } from './api';
import { Incident } from '../types';

let incidentData: Incident[] | null = null;

async function getData() {
  if (!incidentData) {
    incidentData = require('../mocks/incidents.json');
  }
  return incidentData!;
}

export async function getActiveIncidents(): Promise<Incident[]> {
  const data = await getData();
  return mockFetch(data.filter((i) => i.status !== 'cleared'));
}

export async function getIncidentById(id: string): Promise<Incident | undefined> {
  const data = await getData();
  return mockFetch(data.find((i) => i.id === id));
}

export async function getAllIncidents(): Promise<Incident[]> {
  const data = await getData();
  return mockFetch(data);
}
