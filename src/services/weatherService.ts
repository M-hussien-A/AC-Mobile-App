import { mockFetch } from './api';
import { WeatherData } from '../types';

export async function getWeather(): Promise<WeatherData> {
  const data = require('../mocks/weather.json');
  return mockFetch(data);
}
