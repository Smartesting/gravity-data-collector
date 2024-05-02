import { Compressor, DocumentSnapshot } from '../types'

export function createDummy<T>(properties: Partial<T> = {}): T {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return properties as T
}

export function dummyDocumentSnapshot(): DocumentSnapshot {
  return {
    content: '**html**',
    compressor: Compressor.fflate,
    pathname: '/',
    timestamp: 42,
    viewport: { width: 1200, height: 800 },
  }
}
