import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest'
import { collectorInstaller } from './CollectorInstaller'
import { v4 as uuid } from 'uuid'
import { nop } from '../utils/nop'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import VideoRecorderHandler from '../video-recorder/VideoRecorderHandler'
import { GravityRecordingSettings, TargetedUserAction, UserActionType } from '../types'
import CollectorWrapper from './CollectorWrapper'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import { buildGravityRecordingSettingsResponse, mockBuildAndSendSnapshot } from '../test-utils/mocks'
import { createDummy } from '../test-utils/dummyFactory'
import SnapshotRecorderHandler, { isSnapshotTrigger } from '../snapshot-recorder/SnapshotRecorderHandler'
import assert from 'assert'

const installer = () =>
  collectorInstaller({
    requestInterval: 0,
    debug: false,
    authKey: uuid(),
  })

describe('Session recording (events & video & snapshots) depends on remote Gravity settings', () => {
  let initializeEventListeners: SpyInstance
  let initializeVideoRecording: SpyInstance
  let initializeSnapshotRecording: SpyInstance
  let handleSessionUserActions: SpyInstance
  let handleSessionTraits: SpyInstance
  let handleVideoRecords: SpyInstance
  let handleSnapshots: SpyInstance
  let terminateEventRecording: SpyInstance
  let terminateVideoRecording: SpyInstance
  let terminateSnapshotRecording: SpyInstance

  beforeEach(() => {
    initializeEventListeners = vi.spyOn(EventListenersHandler.prototype, 'initializeEventListeners')
    initializeVideoRecording = vi.spyOn(VideoRecorderHandler.prototype, 'initializeRecording').mockImplementation(nop)
    initializeSnapshotRecording = vi
      .spyOn(SnapshotRecorderHandler.prototype, 'initializeRecording')
      .mockImplementation(nop)
    installSpies()
  })

  afterEach(() => {
    initializeEventListeners.mockRestore()
    initializeVideoRecording.mockRestore()
    initializeSnapshotRecording.mockRestore()
    uninstallSpies()
  })

  function installSpies() {
    handleSessionUserActions = vi
      .spyOn(HttpGravityClient.prototype, 'handleSessionUserActions')
      .mockResolvedValue({ error: null })
    handleSessionTraits = vi
      .spyOn(HttpGravityClient.prototype, 'handleSessionTraits')
      .mockResolvedValue({ error: null })
    handleVideoRecords = vi.spyOn(HttpGravityClient.prototype, 'handleVideoRecords').mockResolvedValue({ error: null })
    handleSnapshots = vi.spyOn(HttpGravityClient.prototype, 'handleSnapshots').mockResolvedValue({ error: null })
    vi.spyOn(SnapshotRecorderHandler.prototype, 'buildAndSendSnapshot').mockImplementation(mockBuildAndSendSnapshot)
    terminateEventRecording = vi.spyOn(EventListenersHandler.prototype, 'terminateEventListeners')
    terminateVideoRecording = vi.spyOn(VideoRecorderHandler.prototype, 'terminateRecording')
    terminateSnapshotRecording = vi.spyOn(SnapshotRecorderHandler.prototype, 'terminateRecording')
  }

  function uninstallSpies() {
    handleSessionUserActions.mockRestore()
    handleSessionTraits.mockRestore()
    handleVideoRecords.mockRestore()
    handleSnapshots.mockRestore()
    terminateEventRecording.mockRestore()
    terminateVideoRecording.mockRestore()
    terminateSnapshotRecording.mockRestore()
  }

  describe('use remote settings if available', () => {
    it('records events & videos & snapshots', async () => {
      mockClientGravitySessionRecordingSettings({
        videoRecording: true,
        snapshotRecording: true,
      })
      const collector = installer().install()

      await emitEachEventKind(collector)
      expect(handleSessionUserActions).toHaveBeenCalled()
      expect(handleSessionTraits).toHaveBeenCalled()
      expect(handleVideoRecords).toHaveBeenCalled()
      expect(handleSnapshots).toHaveBeenCalled()

      expect(terminateEventRecording).not.toHaveBeenCalled()
      expect(terminateVideoRecording).not.toHaveBeenCalled()
      expect(terminateSnapshotRecording).not.toHaveBeenCalled()
    })

    it('records events & snapshots BUT no videos', async () => {
      mockClientGravitySessionRecordingSettings({
        videoRecording: false,
        snapshotRecording: true,
      })
      const collector = installer().install()

      await emitEachEventKind(collector)
      expect(handleSessionUserActions).toHaveBeenCalled()
      expect(handleSessionTraits).toHaveBeenCalled()
      expect(handleVideoRecords).not.toHaveBeenCalled()
      expect(handleSnapshots).toHaveBeenCalled()

      expect(terminateEventRecording).not.toHaveBeenCalled()
      expect(terminateVideoRecording).toHaveBeenCalled()
      expect(terminateSnapshotRecording).not.toHaveBeenCalled()
    })

    it('records nothing', async () => {
      mockClientGravitySessionRecordingSettings({
        sessionRecording: false,
      })
      const collector = installer().install()

      await emitEachEventKind(collector)
      expect(handleSessionUserActions).not.toHaveBeenCalled()
      expect(handleSessionTraits).not.toHaveBeenCalled()
      expect(handleVideoRecords).not.toHaveBeenCalled()
      expect(handleSnapshots).not.toHaveBeenCalled()

      expect(terminateEventRecording).toHaveBeenCalled()
      expect(terminateVideoRecording).toHaveBeenCalled()
      expect(terminateSnapshotRecording).toHaveBeenCalled()
    })
  })

  describe('terminate recording', () => {
    it('if error received', async () => {
      mockClientGravitySessionRecordingSettings(null)
      const collector = installer().install()

      await emitEachEventKind(collector)
      expect(handleSessionUserActions).not.toHaveBeenCalled()
      expect(handleSessionTraits).not.toHaveBeenCalled()
      expect(handleVideoRecords).not.toHaveBeenCalled()
      expect(handleSnapshots).not.toHaveBeenCalled()

      expect(terminateEventRecording).toHaveBeenCalled()
      expect(terminateVideoRecording).toHaveBeenCalled()
      expect(terminateSnapshotRecording).toHaveBeenCalled()
    })

    it('if fetch error', async () => {
      const collector = installer()
        .withFetch(vi.fn().mockRejectedValue(new Error('fetch error')))
        .install()

      await emitEachEventKind(collector)
      expect(handleSessionUserActions).not.toHaveBeenCalled()
      expect(handleSessionTraits).not.toHaveBeenCalled()
      expect(handleVideoRecords).not.toHaveBeenCalled()
      expect(handleSnapshots).not.toHaveBeenCalled()

      expect(terminateEventRecording).toHaveBeenCalled()
      expect(terminateVideoRecording).toHaveBeenCalled()
      expect(terminateSnapshotRecording).toHaveBeenCalled()
    })
  })
})

async function emitEachEventKind(collector: CollectorWrapper) {
  const userAction = createDummy<TargetedUserAction>({ type: UserActionType.Change, target: { element: '' } })
  assert(isSnapshotTrigger(userAction), 'dummy userAction must be a snapshot trigger to be able to collect snapshot')
  await collector.userActionHandler.handle(userAction)
  await collector.sessionTraitHandler.handle('age', 42)
  await collector.videoRecorderHandler.handle(createDummy())
  collector.snapshotRecorderHandler.handle()
}

function mockClientGravitySessionRecordingSettings(settings: Partial<GravityRecordingSettings> | null) {
  vi.spyOn(HttpGravityClient.prototype, 'readSessionCollectionSettings').mockResolvedValue(
    buildGravityRecordingSettingsResponse(settings),
  )
}
