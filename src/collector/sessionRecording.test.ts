import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { collectorInstaller } from './CollectorInstaller'
import { v4 as uuid } from 'uuid'
import { nop } from '../utils/nop'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import VideoRecorderHandler from '../video-recorder/VideoRecorderHandler'
import { GravityRecordingSettings, TargetedUserAction, UserActionType } from '../types'
import CollectorWrapper from './CollectorWrapper'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import { buildGravityRecordingSettingsResponse } from '../test-utils/mocks'
import { createDummy } from '../test-utils/dummyFactory'

const installer = () =>
  collectorInstaller({
    requestInterval: 0,
    debug: false,
    authKey: uuid(),
  })

describe('Session recording (events & video) depends on remote Gravity settings', () => {
  let initializeEventListeners: MockInstance
  let initializeVideoRecording: MockInstance
  let handleSessionUserActions: MockInstance
  let handleSessionTraits: MockInstance
  let handleVideoRecords: MockInstance
  let terminateEventRecording: MockInstance
  let terminateVideoRecording: MockInstance

  beforeEach(() => {
    initializeEventListeners = vi.spyOn(EventListenersHandler.prototype, 'initializeEventListeners')
    initializeVideoRecording = vi.spyOn(VideoRecorderHandler.prototype, 'initializeRecording').mockImplementation(nop)
    installSpies()
  })

  afterEach(() => {
    initializeEventListeners.mockRestore()
    initializeVideoRecording.mockRestore()
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
    terminateEventRecording = vi.spyOn(EventListenersHandler.prototype, 'terminateEventListeners')
    terminateVideoRecording = vi.spyOn(VideoRecorderHandler.prototype, 'terminateRecording')
  }

  function uninstallSpies() {
    handleSessionUserActions.mockRestore()
    handleSessionTraits.mockRestore()
    handleVideoRecords.mockRestore()
    terminateEventRecording.mockRestore()
    terminateVideoRecording.mockRestore()
  }

  describe('use remote settings if available', () => {
    it('records events & videos', async () => {
      mockClientGravitySessionRecordingSettings({
        videoRecording: true,
      })
      const collector = installer().install()

      await emitEachEventKind(collector)
      expect(handleSessionUserActions).toHaveBeenCalled()
      expect(handleSessionTraits).toHaveBeenCalled()
      expect(handleVideoRecords).toHaveBeenCalled()

      expect(terminateEventRecording).not.toHaveBeenCalled()
      expect(terminateVideoRecording).not.toHaveBeenCalled()
    })

    it('records events BUT no videos', async () => {
      mockClientGravitySessionRecordingSettings({
        videoRecording: false,
      })
      const collector = installer().install()

      await emitEachEventKind(collector)
      expect(handleSessionUserActions).toHaveBeenCalled()
      expect(handleSessionTraits).toHaveBeenCalled()
      expect(handleVideoRecords).not.toHaveBeenCalled()

      expect(terminateEventRecording).not.toHaveBeenCalled()
      expect(terminateVideoRecording).toHaveBeenCalled()
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

      expect(terminateEventRecording).toHaveBeenCalled()
      expect(terminateVideoRecording).toHaveBeenCalled()
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

      expect(terminateEventRecording).toHaveBeenCalled()
      expect(terminateVideoRecording).toHaveBeenCalled()
    })

    it('if fetch error', async () => {
      const collector = installer()
        .withFetch(vi.fn().mockRejectedValue(new Error('fetch error')))
        .install()

      await emitEachEventKind(collector)
      expect(handleSessionUserActions).not.toHaveBeenCalled()
      expect(handleSessionTraits).not.toHaveBeenCalled()
      expect(handleVideoRecords).not.toHaveBeenCalled()

      expect(terminateEventRecording).toHaveBeenCalled()
      expect(terminateVideoRecording).toHaveBeenCalled()
    })
  })
})

async function emitEachEventKind(collector: CollectorWrapper) {
  const userAction = createDummy<TargetedUserAction>({ type: UserActionType.Change, target: { element: '' } })
  await collector.userActionHandler.handle(userAction)
  await collector.sessionTraitHandler.handle('age', 42)
  await collector.videoRecorderHandler.handle(createDummy())
}

function mockClientGravitySessionRecordingSettings(settings: Partial<GravityRecordingSettings> | null) {
  vi.spyOn(HttpGravityClient.prototype, 'readSessionCollectionSettings').mockResolvedValue(
    buildGravityRecordingSettingsResponse(settings),
  )
}
