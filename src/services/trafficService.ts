import { mockFetch } from './api';
import { Intersection, RoadSegment } from '../types';

let trafficData: any = null;

async function getTrafficData() {
  if (!trafficData) {
    trafficData = require('../mocks/traffic.json');
  }
  return trafficData;
}

export async function getIntersections(): Promise<Intersection[]> {
  const data = await getTrafficData();
  return mockFetch(data.intersections);
}

export async function getRoadSegments(): Promise<RoadSegment[]> {
  const data = await getTrafficData();
  return mockFetch(data.roadSegments);
}

export async function getIntersectionById(id: string): Promise<Intersection | undefined> {
  const data = await getTrafficData();
  const intersection = data.intersections.find((i: Intersection) => i.id === id);
  return mockFetch(intersection);
}

export async function getMapData() {
  const data = await getTrafficData();
  return mockFetch({
    intersections: data.intersections,
    roadSegments: data.roadSegments,
  });
}
