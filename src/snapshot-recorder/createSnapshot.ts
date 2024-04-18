import { createCache, createMirror, rebuild, snapshot as doSnapshot } from 'rrweb-snapshot'
import { SnapshotOptions } from '../utils/rrwebRecordingSettings'
import { JSDOM } from 'jsdom'
import { Benchmark } from '../monitoring-tests/Benchmark'

export function createSnapshot(forDocument: Document, options: SnapshotOptions, benchmark?: Benchmark): string | null {
  try {
    benchmark?.timestamp()
    const snapshot = doSnapshot(forDocument, options)
    benchmark?.recordDuration('doSnasphot')
    if (!snapshot) return null

    const mirror = createMirror()
    const jsdom = new JSDOM()
    const document = jsdom.window.document
    benchmark?.timestamp()
    const node = rebuild(snapshot, {
      doc: document,
      cache: createCache(),
      mirror,
    })
    benchmark?.recordDuration('rebuild')

    if (node) {
      const serialized = jsdom.serialize()
      mirror.reset()
      jsdom.window.document.body.remove()
      benchmark?.recordDuration('cleanup')
      return serialized
    }
  } catch (e) {
    console.error(e)
  }
  return null
}
