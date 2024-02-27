import { IGravityClient } from '../gravity-client/IGravityClient'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { ScreenRecordingOptions } from './ScreenRecorderHandler'
import { createCache, createMirror, rebuild, snapshot as doSnapshot } from 'rrweb-snapshot'
import { WITH_PARTIAL_ANONYMIZATION, WITH_TOTAL_ANONYMIZATION } from './recordingSettings'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import { KeyUserActionData, UserAction, UserActionTarget, UserActionType } from '../types'
import isTargetedUserAction from '../utils/isTargetedUserAction'
import { CLICKABLE_ELEMENT_TAG_NAMES } from '../user-action/createTargetedUserAction'

type SnapshotOptions = Parameters<typeof doSnapshot>[1]

export default class SnapshotRecorderHandler {
  private options: SnapshotOptions | null = null
  private lastSnapshot: string | null = null

  constructor(
    private readonly window: Window,
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly gravityClient: IGravityClient,
  ) {}

  initializeRecording(settings: ScreenRecordingOptions) {
    this.lastSnapshot = null
    this.options = settings.enableAnonymization ? WITH_TOTAL_ANONYMIZATION : WITH_PARTIAL_ANONYMIZATION
    if (settings.anonymizeSelectors) {
      this.options.maskTextSelector = settings.anonymizeSelectors
    }
    this.options.blockSelector = settings.ignoreSelectors
    void this.handle()
  }

  terminateRecording() {
    this.lastSnapshot = null
    this.options = null
  }

  async handle(action?: UserAction) {
    if (!this.options) return
    if (!isSnapshotTrigger(action)) return
    if (this.timeoutHandler.isExpired()) return
    const snapshot = createSnapshot(this.window.document, this.options)
    if (!snapshot) return
    if (snapshot === this.lastSnapshot) return
    this.lastSnapshot = snapshot
    await this.gravityClient.addSnapshot(this.sessionIdHandler.get(), { content: snapshot, timestamp: Date.now() })
  }
}

function isSnapshotTrigger(userAction?: UserAction) {
  if (userAction && isTargetedUserAction(userAction)) {
    const target: UserActionTarget = userAction.interactiveTarget ?? userAction.target
    return (
      userAction.type === UserActionType.Change ||
      (userAction.type === UserActionType.Click &&
        CLICKABLE_ELEMENT_TAG_NAMES.includes(target.element as keyof HTMLElementTagNameMap)) ||
      (userAction.type === UserActionType.KeyDown &&
        ((userAction.userActionData as KeyUserActionData)?.code === 'Escape' ||
          (userAction.userActionData as KeyUserActionData)?.code === 'Tab' ||
          (userAction.userActionData as KeyUserActionData)?.code === 'Enter')) ||
      userAction.type === UserActionType.Drop ||
      userAction.type === UserActionType.Resize
    )
  }
  return false
}

const SNAPSHOT_CONTAINER_ID = 'gravity-data-collector-snapshot'

function createSnapshot(document: Document, options: SnapshotOptions): string | null {
  try {
    const snapshot = doSnapshot(document, options)
    if (!snapshot) return null
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
      iFrame.setAttribute('title', 'gravity-data-collector-snapshot-iframe')
      shadow.appendChild(iFrame)
    }
    const iFrameDocument = (snapshotContainer.shadowRoot?.children[0] as HTMLIFrameElement).contentWindow?.document
    if (!iFrameDocument) return null

    const node = rebuild(snapshot, {
      doc: iFrameDocument,
      cache: createCache(),
      mirror: createMirror(),
    })
    return node ? new XMLSerializer().serializeToString(node) : null
  } catch (e) {
    console.error(e)
    return null
  }
}
