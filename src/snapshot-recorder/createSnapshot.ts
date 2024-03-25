import { createCache, createMirror, rebuild, snapshot as doSnapshot } from 'rrweb-snapshot'
import { SnapshotOptions } from '../utils/rrwebRecordingSettings'

export function createSnapshot(forDocument: Document, inDocument: Document, options: SnapshotOptions): string | null {
  try {
    const snapshot = doSnapshot(forDocument, options)
    if (!snapshot) return null
    if (!inDocument) return null

    // Note: we use a hash in order to be able to delete it when cleaning up.
    const data: { node?: Node | null } = {}
    const mirror = createMirror()

    data.node = rebuild(snapshot, {
      doc: inDocument,
      cache: createCache(),
      mirror,
    })
    if (data.node) {
      const serialized = new XMLSerializer().serializeToString(data.node)
      removeAllChildren(data.node)
      delete data.node
      mirror.reset()

      return serialized
    }
  } catch (e) {
    console.error(e)
  }
  return null
}

function removeAllChildren(element: Node) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}
