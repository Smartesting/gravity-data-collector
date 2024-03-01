import { IGravityClient } from '../gravity-client/IGravityClient'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { ScreenRecordingOptions } from '../screen-recorder/ScreenRecorderHandler'
import { SnapshotOptions, WITH_PARTIAL_ANONYMIZATION, WITH_TOTAL_ANONYMIZATION } from '../utils/rrwebRecordingSettings'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import {
  CLICKABLE_ELEMENT_TAG_NAMES,
  DocumentSnapshot,
  KeyUserActionData,
  SessionUserAction,
  TargetedUserAction,
  UserAction,
  UserActionTarget,
  UserActionType,
} from '../types'
import isTargetedUserAction from '../utils/isTargetedUserAction'
import { createSnapshot } from './createSnapshot'

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
