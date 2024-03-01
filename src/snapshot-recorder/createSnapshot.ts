import { createCache, createMirror, rebuild, snapshot as doSnapshot } from 'rrweb-snapshot'
import { SnapshotOptions } from '../utils/rrwebRecordingSettings'

const SNAPSHOT_CONTAINER_ID = 'gravity-data-collector-snapshot'

interface Snapshot {
  html: string | null
  elementCount: number
}

export function createSnapshot(document: Document, options: SnapshotOptions): Snapshot {
  try {
    const snapshot = doSnapshot(document, options)
    if (!snapshot) return { html: null, elementCount: 0 }
    const iFrameDocument = seekSnapshotIFrameDocument()
    if (!iFrameDocument) return { html: null, elementCount: 0 }

    const node = rebuild(snapshot, {
      doc: iFrameDocument,
      cache: createCache(),
      mirror: createMirror(),
    })
    if (node) {
      let elementCount = iFrameDocument.body.querySelectorAll('*').length
      if (iFrameDocument.body.querySelector('#' + SNAPSHOT_CONTAINER_ID)) {
        elementCount--
      }
      return { html: new XMLSerializer().serializeToString(node), elementCount }
    }
  } catch (e) {
    console.error(e)
  }
  return { html: null, elementCount: 0 }
}

function seekSnapshotIFrameDocument(): Document | undefined {
  let snapshotContainer = document.getElementById(SNAPSHOT_CONTAINER_ID)
  if (!snapshotContainer) {
    snapshotContainer = document.createElement('div')
    snapshotContainer.setAttribute('id', SNAPSHOT_CONTAINER_ID)
    snapshotContainer.style.display = 'none'
    snapshotContainer.style.position = 'absolute !important'
    snapshotContainer.style.top = '0px !important'
    snapshotContainer.style.left = '0px !important'
    snapshotContainer.style.height = '0px !important'
    snapshotContainer.style.width = '0px !important'
    document.body.appendChild(snapshotContainer)
    const shadow = snapshotContainer.attachShadow({ mode: 'open' })
    const iFrame = document.createElement('iframe')
    iFrame.setAttribute('src', 'about:blank')
    iFrame.setAttribute('title', 'gravity-data-collector-snapshot-iframe')
    shadow.appendChild(iFrame)
  }
  return (snapshotContainer.shadowRoot?.children[0] as HTMLIFrameElement).contentWindow?.document
}
