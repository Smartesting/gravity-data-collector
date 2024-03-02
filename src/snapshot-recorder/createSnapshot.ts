import { createCache, createMirror, rebuild, snapshot as doSnapshot } from 'rrweb-snapshot'
import { SnapshotOptions } from '../utils/rrwebRecordingSettings'

export function createSnapshot(forDocument: Document, inDocument: Document, options: SnapshotOptions): string | null {
  try {
    const snapshot = doSnapshot(forDocument, options)
    if (!snapshot) return null
    if (!inDocument) return null

    const node = rebuild(snapshot, {
      doc: inDocument,
      cache: createCache(),
      mirror: createMirror(),
    })
    if (node) return new XMLSerializer().serializeToString(node)
  } catch (e) {
    console.error(e)
  }
  return null
}
