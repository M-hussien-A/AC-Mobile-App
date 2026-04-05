import { mockFetch } from './api';
import { UserProfile } from '../types';

let userData: any = null;

async function getData() {
  if (!userData) {
    userData = require('../mocks/user.json');
  }
  return userData;
}

export async function login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
  const data = await getData();
  return mockFetch({ token: 'mock-jwt-token-' + Date.now(), user: data.profile }, 800);
}

export async function loginWithSSO(): Promise<{ token: string; user: UserProfile }> {
  const data = await getData();
  return mockFetch({ token: 'mock-sso-token-' + Date.now(), user: data.profile }, 1000);
}

export async function register(name: string, email: string, phone: string, password: string): Promise<{ token: string; user: UserProfile }> {
  const data = await getData();
  return mockFetch({
    token: 'mock-jwt-token-' + Date.now(),
    user: { ...data.profile, name, email, phone },
  }, 800);
}

export async function getProfile(): Promise<UserProfile> {
  const data = await getData();
  return mockFetch(data.profile);
}

export async function updatePreferences(prefs: Record<string, any>): Promise<void> {
  await mockFetch(null, 300);
}
