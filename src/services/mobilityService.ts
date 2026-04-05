import { mockFetch } from './api';
import { BikeScooterStation, EVChargingStation, LoadingZone } from '../types';

let mobilityData: any = null;

async function getData() {
  if (!mobilityData) {
    mobilityData = require('../mocks/mobility.json');
  }
  return mobilityData;
}

export async function getBikeScooterStations(): Promise<BikeScooterStation[]> {
  const data = await getData();
  return mockFetch(data.bikeScooterStations);
}

export async function getEVChargingStations(): Promise<EVChargingStation[]> {
  const data = await getData();
  return mockFetch(data.evChargingStations);
}

export async function getLoadingZones(): Promise<LoadingZone[]> {
  const data = await getData();
  return mockFetch(data.loadingZones);
}
