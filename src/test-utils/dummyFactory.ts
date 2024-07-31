export function createDummy<T>(properties: Partial<T> = {}): T {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return properties as T
}
