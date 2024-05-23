import { IGravityClient } from '../gravity-client/IGravityClient'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { SnapshotOptions } from '../utils/rrwebRecordingSettings'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import {
  CLICKABLE_ELEMENT_TAG_NAMES,
  CollectorOptions,
  Compressor,
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
import { AtatusBenchmark } from '../monitoring/AtatusBenchmark'
import ITextCompressor from '../text-compressor/ITextCompressor'
import FFLateCompressor from '../text-compressor/FFlateCompressor'

export interface ISnapshotRecorderHandler {
  onUserAction: (action: UserAction) => void
}

export default class SnapshotRecorderHandler implements ISnapshotRecorderHandler {
  private readonly observer = new MutationObserver(this.handle.bind(this))
  private snapshotDocument: Document | undefined
  private snapshotOptions: SnapshotOptions | null = {}
  private pendingUserAction = false

  constructor(
    private readonly collectorOptions: CollectorOptions,
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly gravityClient: IGravityClient,
    private readonly textCompressor: ITextCompressor = FFLateCompressor,
  ) {}

  initializeRecording() {
    if (this.snapshotOptions) {
      this.snapshotOptions.inlineStylesheet = this.collectorOptions.inlineResources
      this.snapshotOptions.inlineImages = this.collectorOptions.inlineResources
    }
    this.snapshotDocument = installSnapshotContainer(this.collectorOptions.window.document)

    if (this.snapshotDocument) {
      this.observer.observe(this.collectorOptions.window.document.body, { childList: true, subtree: true })
    }
  }

  terminateRecording() {
    this.snapshotOptions = null
    dropSnapshotContainer(this.collectorOptions.window.document)
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
    this.debounce(() => {
      if (!this.snapshotOptions || !this.snapshotDocument) return
      const window = this.collectorOptions.window
      const pathname = getLocationPathname(window, this.collectorOptions)
      const html = createSnapshot(window.document, this.snapshotDocument, this.snapshotOptions, new AtatusBenchmark())
      if (!html) return
      const { compressed, compressor } = this.textCompressor.compress(html)
      const documentSnapshot = this.createDocumentSnapshot(
        compressed,
        compressor,
        pathname,
        window.innerWidth,
        window.innerHeight,
      )
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

  createDocumentSnapshot(
    content: string,
    compressor: Compressor,
    pathname: string,
    width: number,
    height: number,
  ): DocumentSnapshot {
    return {
      content,
      compressor,
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
