import { createCache, createMirror, rebuild, snapshot as doSnapshot } from 'rrweb-snapshot'
import { SnapshotOptions } from '../utils/rrwebRecordingSettings'
import { IBenchmark } from '../monitoring/IBenchmark'

export function createSnapshot(
  forDocument: Document,
  inDocument: Document,
  options: SnapshotOptions,
  benchmark?: IBenchmark,
): string | null {
  try {
    benchmark?.timestamp()
    const snapshot = doSnapshot(forDocument, options)
    benchmark?.recordTime('doSnasphot')
    if (!snapshot) return null
    if (!inDocument) return null

    // Note: we use a hash in order to be able to delete it when cleaning up.
    const data: { node?: Node | null } = {}
    const mirror = createMirror()

    benchmark?.timestamp()
    data.node = rebuild(snapshot, {
      doc: inDocument,
      cache: createCache(),
      mirror,
    })
    benchmark?.recordTime('rebuild')
    if (data.node) {
      const serialized = new XMLSerializer().serializeToString(data.node)
      removeAllChildren(data.node)
      delete data.node
      mirror.reset()
      benchmark?.recordTime('cleanup')
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
