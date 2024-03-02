import { IGravityClient } from '../gravity-client/IGravityClient'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { ScreenRecordingOptions } from '../screen-recorder/ScreenRecorderHandler'
import { SnapshotOptions, WITH_PARTIAL_ANONYMIZATION, WITH_TOTAL_ANONYMIZATION } from '../utils/rrwebRecordingSettings'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import { CollectorOptions, DocumentSnapshot } from '../types'
import { createSnapshot } from './createSnapshot'
import getLocationPathname from '../utils/getLocationPathname'
import { dropSnapshotContainer, installSnapshotContainer } from './snapshotContainer'

export default class SnapshotRecorderHandler {
  private snapshotOptions: SnapshotOptions | null = null
  private snapshotDocument: Document | undefined
  private readonly observer = new MutationObserver(this.handle.bind(this))

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
      void this.handle()
    }
  }

  terminateRecording() {
    this.snapshotOptions = null
    dropSnapshotContainer(window.document)
    if (this.snapshotDocument) {
      this.observer.disconnect()
      this.snapshotDocument = undefined
    }
  }

  handle(mutations?: MutationRecord[]) {
    console.log(mutations ? `${mutations.length} mutations` : 'initial snapshot') // TODO remove this log
    if (!this.snapshotOptions || !this.snapshotDocument) return
    if (this.timeoutHandler.isExpired()) return
    const document = this.collectorOptions.window.document
    const html = createSnapshot(document, this.snapshotDocument, this.snapshotOptions)
    if (!html) return
    const documentSnapshot = this.createDocumentSnapshot(html)
    void this.gravityClient.addSnapshot(this.sessionIdHandler.get(), documentSnapshot)
  }

  createDocumentSnapshot(content: string): DocumentSnapshot {
    const window = this.collectorOptions.window
    const pathname = getLocationPathname(window, this.collectorOptions)
    const { innerWidth: width, innerHeight: height } = window
    return {
      content,
      pathname,
      timestamp: Date.now(),
      viewport: { width, height },
    }
  }
}
