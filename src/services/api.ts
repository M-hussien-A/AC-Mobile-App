const delay = (ms?: number) =>
  new Promise((resolve) => setTimeout(resolve, ms ?? 300 + Math.random() * 500));

export async function mockFetch<T>(data: T, delayMs?: number): Promise<T> {
  await delay(delayMs);
  return JSON.parse(JSON.stringify(data));
}

export async function mockFetchWithError<T>(
  data: T,
  errorRate = 0,
  delayMs?: number
): Promise<T> {
  await delay(delayMs);
  if (Math.random() < errorRate) {
    throw new Error('Network request failed');
  }
  return JSON.parse(JSON.stringify(data));
}
