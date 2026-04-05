import { mockFetch } from './api';
import { DMSMessage } from '../types';

let dmsData: DMSMessage[] | null = null;

async function getData() {
  if (!dmsData) {
    dmsData = require('../mocks/dmsMessages.json');
  }
  return dmsData!;
}

export async function getActiveDmsMessages(): Promise<DMSMessage[]> {
  const data = await getData();
  return mockFetch(data);
}

export async function getDmsById(id: string): Promise<DMSMessage | undefined> {
  const data = await getData();
  return mockFetch(data.find((d) => d.id === id));
}

export async function getDmsByType(type: string): Promise<DMSMessage[]> {
  const data = await getData();
  return mockFetch(type === 'all' ? data : data.filter((d) => d.messageType === type));
}
