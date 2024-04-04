import { IGravityClient } from '../gravity-client/IGravityClient'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { ScreenRecordingOptions } from '../video-recorder/VideoRecorderHandler'
import { SnapshotOptions, WITH_PARTIAL_ANONYMIZATION, WITH_TOTAL_ANONYMIZATION } from '../utils/rrwebRecordingSettings'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import {
  CLICKABLE_ELEMENT_TAG_NAMES,
  CollectorOptions,
  DocumentSnapshot,
  KeyUserActionData,
  TargetedUserAction,
  UserAction,
  UserActionTarget,
  UserActionType,
} from '../types'
import { createSnapshot } from './createSnapshot'
import getLocationPathname from '../utils/getLocationPathname'
import { dropSnapshotContainer, installSnapshotContainer } from './snapshotContainer'
import isTargetedUserAction from '../utils/isTargetedUserAction'

export interface ISnapshotRecorderHandler {
  onUserAction: (action: UserAction) => void
}

export default class SnapshotRecorderHandler implements ISnapshotRecorderHandler {
  private snapshotOptions: SnapshotOptions | null = null
  private snapshotDocument: Document | undefined
  private readonly observer = new MutationObserver(this.handle.bind(this))
  private pendingUserAction = false

  constructor(
    private readonly collectorOptions: CollectorOptions,
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly gravityClient: IGravityClient,
  ) {}

  initializeRecording(settings: ScreenRecordingOptions) {
    this.snapshotOptions = settings.enableAnonymization ? WITH_TOTAL_ANONYMIZATION : WITH_PARTIAL_ANONYMIZATION
    if (settings.anonymizeSelectors) {
      this.snapshotOptions.maskTextSelector = settings.anonymizeSelectors
    }
    this.snapshotOptions.blockSelector = settings.ignoreSelectors
    this.snapshotDocument = installSnapshotContainer(window.document)
    if (this.snapshotDocument) {
      this.observer.observe(window.document.body, { childList: true, subtree: true })
    }
  }

  terminateRecording() {
    this.snapshotOptions = null
    dropSnapshotContainer(window.document)
    if (this.snapshotDocument) {
      this.observer.disconnect()
      this.snapshotDocument = undefined
    }
    this.pendingUserAction = false
  }

  onUserAction(userAction: UserAction) {
    if (isSnapshotTrigger(userAction)) {
      this.pendingUserAction = true
    }
  }

  handle() {
    if (this.timeoutHandler.isExpired()) return
    if (this.pendingUserAction) {
      this.pendingUserAction = false
      this.buildAndSendSnapshot()
    }
  }

  buildAndSendSnapshot() {
    const window = this.collectorOptions.window
    const pathname = getLocationPathname(window, this.collectorOptions)
    this.debounce(() => {
      if (!this.snapshotOptions || !this.snapshotDocument) return
      const html = createSnapshot(window.document, this.snapshotDocument, this.snapshotOptions)
      if (!html) return
      const documentSnapshot = this.createDocumentSnapshot(html, pathname)
      void this.gravityClient.addSnapshot(this.sessionIdHandler.get(), documentSnapshot)
    })
  }

  timer: NodeJS.Timeout | null = null

  debounce(fn: () => void) {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      fn()
    }, 150)
  }

  createDocumentSnapshot(content: string, pathname: string): DocumentSnapshot {
    const window = this.collectorOptions.window
    const { innerWidth: width, innerHeight: height } = window
    return {
      content,
      pathname,
      timestamp: Date.now(),
      viewport: { width, height },
    }
  }
}

export function isSnapshotTrigger(userAction?: UserAction): userAction is TargetedUserAction {
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
