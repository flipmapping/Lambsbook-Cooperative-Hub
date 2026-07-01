const runtimeCache = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return runtimeCache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  runtimeCache.set(key, value);
}

export function clearRuntimeCache(): void {
  runtimeCache.clear();
}
