const SNAPSHOT_CONTAINER_ID = 'gravity-data-collector-snapshot'

export function installSnapshotContainer(inDocument: Document): Document | undefined {
  let snapshotContainer = inDocument.getElementById(SNAPSHOT_CONTAINER_ID)
  if (!snapshotContainer) {
    snapshotContainer = inDocument.createElement('div')
    snapshotContainer.setAttribute('id', SNAPSHOT_CONTAINER_ID)
    snapshotContainer.style.display = 'none'
    snapshotContainer.style.position = 'absolute !important'
    snapshotContainer.style.top = '0px !important'
    snapshotContainer.style.left = '0px !important'
    snapshotContainer.style.height = '0px !important'
    snapshotContainer.style.width = '0px !important'
    inDocument.body.appendChild(snapshotContainer)
    const shadow = snapshotContainer.attachShadow({ mode: 'open' })
    const iFrame = inDocument.createElement('iframe')
    iFrame.setAttribute('src', 'about:blank')
    iFrame.setAttribute('title', 'gravity-data-collector-snapshot-iframe')
    shadow.appendChild(iFrame)
  }
  return (snapshotContainer.shadowRoot?.children[0] as HTMLIFrameElement).contentWindow?.document
}

export function dropSnapshotContainer(fromDocument: Document) {
  const snapshotContainer = fromDocument.getElementById(SNAPSHOT_CONTAINER_ID)
  if (snapshotContainer) {
    snapshotContainer.parentNode?.removeChild(snapshotContainer)
  }
}
