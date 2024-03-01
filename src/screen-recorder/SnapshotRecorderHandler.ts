import { IGravityClient } from '../gravity-client/IGravityClient'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { ScreenRecordingOptions } from './ScreenRecorderHandler'
import { createCache, createMirror, rebuild, snapshot as doSnapshot } from 'rrweb-snapshot'
import { WITH_PARTIAL_ANONYMIZATION, WITH_TOTAL_ANONYMIZATION } from './recordingSettings'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import {
  DocumentSnapshot,
  KeyUserActionData,
  SessionUserAction,
  TargetedUserAction,
  UserAction,
  UserActionTarget,
  UserActionType,
  CLICKABLE_ELEMENT_TAG_NAMES,
} from '../types'
import isTargetedUserAction from '../utils/isTargetedUserAction'

type SnapshotOptions = Parameters<typeof doSnapshot>[1]

export default class SnapshotRecorderHandler {
  private options: SnapshotOptions | null = null
  private lastSnapshot: DocumentSnapshot | null = null
  private lastSnapshotElementCount = -1

  constructor(
    private readonly window: Window,
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly gravityClient: IGravityClient,
  ) {}

  initializeRecording(settings: ScreenRecordingOptions) {
    this.lastSnapshot = null
    this.lastSnapshotElementCount = -1
    this.options = settings.enableAnonymization ? WITH_TOTAL_ANONYMIZATION : WITH_PARTIAL_ANONYMIZATION
    if (settings.anonymizeSelectors) {
      this.options.maskTextSelector = settings.anonymizeSelectors
    }
    this.options.blockSelector = settings.ignoreSelectors
  }

  terminateRecording() {
    this.lastSnapshot = null
    this.lastSnapshotElementCount = -1
    this.options = null
  }

  async handle(action: SessionUserAction) {
    if (!this.options) return
    if (this.timeoutHandler.isExpired()) return
    if (!action || !isSnapshotTrigger(action)) return
    const { html, elementCount } = createSnapshot(this.window.document, this.options)
    if (!html) return

    const pathname = action.location.pathname
    console.log({ elementCount })
    if (
      this.lastSnapshot &&
      this.lastSnapshot.pathname === pathname &&
      this.lastSnapshotElementCount === elementCount
    ) {
      return
    }
    const documentSnapshot: DocumentSnapshot = {
      content: html,
      pathname,
      timestamp: Date.now(),
      viewport: action.viewportData,
    }
    this.lastSnapshot = documentSnapshot
    this.lastSnapshotElementCount = elementCount
    await this.gravityClient.addSnapshot(this.sessionIdHandler.get(), documentSnapshot)
  }
}

function isSnapshotTrigger(userAction?: UserAction): userAction is TargetedUserAction {
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

function createSnapshot(document: Document, options: SnapshotOptions): { html: string | null, elementCount: number } {
  try {
    const snapshot = doSnapshot(document, options)
    if (!snapshot) return { html: null, elementCount: 0 }
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
