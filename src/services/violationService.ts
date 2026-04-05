import { mockFetch } from './api';
import { Violation } from '../types';

let violationData: Violation[] | null = null;

async function getData() {
  if (!violationData) {
    violationData = require('../mocks/violations.json');
  }
  return violationData!;
}

export async function getViolations(vehiclePlate?: string): Promise<Violation[]> {
  const data = await getData();
  if (vehiclePlate) {
    return mockFetch(data.filter((v) => v.vehiclePlate === vehiclePlate));
  }
  return mockFetch(data);
}

export async function getViolationById(id: string): Promise<Violation | undefined> {
  const data = await getData();
  return mockFetch(data.find((v) => v.id === id));
}

export async function payViolation(id: string, method: string): Promise<{ success: boolean; transactionId: string }> {
  return mockFetch({ success: true, transactionId: `VIO-PAY-${Date.now()}` }, 1000);
}
