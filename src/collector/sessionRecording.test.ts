import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest'
import { collectorInstaller } from './CollectorInstaller'
import { v4 as uuid } from 'uuid'
import { nop } from '../utils/nop'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'
import ConsoleGravityClient from '../gravity-client/ConsoleGravityClient'
import {
  ReadSessionCollectionSettingsError,
  ReadSessionCollectionSettingsResponse,
  SessionCollectionSettings,
} from '../types'
import CollectorWrapper from './CollectorWrapper'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import { mockFetch } from '../test-utils/mocks'
import { createDummy } from '../test-utils/dummyFactory'
import { Class } from '../test-utils/types'
import AbstractGravityClient from '../gravity-client/AbstractGravityClient'
import { getLastCallFirstArgument } from '../test-utils/spies'

describe('Session recording (events & video) depends on remote Gravity settings', () => {
  let initializeEventListeners: SpyInstance
  let initializeScreenRecording: SpyInstance
  let handleSessionUserActions: SpyInstance
  let handleSessionTraits: SpyInstance
  let handleScreenRecords: SpyInstance
  let terminateEventRecording: SpyInstance
  let terminateVideoRecording: SpyInstance

  beforeEach(() => {
    initializeEventListeners = vi.spyOn(EventListenersHandler.prototype, 'initializeEventListeners')
    initializeScreenRecording = vi.spyOn(ScreenRecorderHandler.prototype, 'initializeRecording').mockImplementation(nop)
  })

  afterEach(() => {
    initializeEventListeners.mockRestore()
    initializeScreenRecording.mockRestore()
  })

  function installSpies(clientClass: Class<AbstractGravityClient>) {
    handleSessionUserActions = vi
      .spyOn(clientClass.prototype, 'handleSessionUserActions')
      .mockResolvedValue({ error: null })
    handleSessionTraits = vi.spyOn(clientClass.prototype, 'handleSessionTraits').mockResolvedValue({ error: null })
    handleScreenRecords = vi.spyOn(clientClass.prototype, 'handleScreenRecords').mockResolvedValue({ error: null })
    terminateEventRecording = vi.spyOn(EventListenersHandler.prototype, 'terminateEventListeners')
    terminateVideoRecording = vi.spyOn(ScreenRecorderHandler.prototype, 'terminateRecording')
  }

  function uninstallSpies() {
    handleSessionUserActions.mockRestore()
    handleSessionTraits.mockRestore()
    handleScreenRecords.mockRestore()
    terminateEventRecording.mockRestore()
    terminateVideoRecording.mockRestore()
  }

  describe('on dry run mode (debug=true)', () => {
    const installer = () =>
      collectorInstaller({
        requestInterval: 0,
        debug: true,
      })

    beforeEach(() => installSpies(ConsoleGravityClient))
    afterEach(uninstallSpies)

    describe('use options settings if available', () => {
      it('records events & video', async () => {
        const collector = installer()
          .withOptions({
            enableEventRecording: true,
            enableVideoRecording: true,
          })
          .install()

        await emitEachEventKind(collector)
        expect(handleSessionUserActions).toHaveBeenCalled()
        expect(handleSessionTraits).toHaveBeenCalled()
        expect(handleScreenRecords).toHaveBeenCalled()

        expect(terminateEventRecording).not.toHaveBeenCalled()
        expect(terminateVideoRecording).not.toHaveBeenCalled()
      })

      it('records events BUT no videos', async () => {
        const collector = installer()
          .withOptions({
            enableEventRecording: true,
            enableVideoRecording: false,
          })
          .install()

        await emitEachEventKind(collector)
        expect(handleSessionUserActions).toHaveBeenCalled()
        expect(handleSessionTraits).toHaveBeenCalled()
        expect(handleScreenRecords).not.toHaveBeenCalled()

        expect(terminateEventRecording).not.toHaveBeenCalled()
        expect(terminateVideoRecording).toHaveBeenCalled()
      })

      it('records nothing', async () => {
        const collector = installer()
          .withOptions({
            enableEventRecording: false,
            enableVideoRecording: true,
          })
          .install()

        await emitEachEventKind(collector)
        expect(handleSessionUserActions).not.toHaveBeenCalled()
        expect(handleSessionTraits).not.toHaveBeenCalled()
        expect(handleScreenRecords).not.toHaveBeenCalled()

        expect(terminateEventRecording).toHaveBeenCalled()
        expect(terminateVideoRecording).toHaveBeenCalled()
      })
    })

    it('else use default settings', async () => {
      const collector = installer().install()

      await emitEachEventKind(collector)
      expect(handleSessionUserActions).toHaveBeenCalled()
      expect(handleSessionTraits).toHaveBeenCalled()
      expect(handleScreenRecords).toHaveBeenCalled()

      expect(terminateEventRecording).not.toHaveBeenCalled()
      expect(terminateVideoRecording).not.toHaveBeenCalled()
    })
  })

  describe('on live mode (debug=false)', () => {
    const installer = () =>
      collectorInstaller({
        requestInterval: 0,
        debug: false,
        authKey: uuid(),
      })

    beforeEach(() => installSpies(HttpGravityClient))
    afterEach(uninstallSpies)

    describe('use remote settings if available', () => {
      it('records events & videos', async () => {
        const collector = installer()
          .withFetch(
            mockFetchCollectionSettings({
              sessionRecording: true,
              videoRecording: true,
              snapshotRecording: true,
              videoAnonymization: true,
              anonymizeSelectors: undefined,
              ignoreSelectors: undefined,
            }),
          )
          .install()

        await emitEachEventKind(collector)
        expect(handleSessionUserActions).toHaveBeenCalled()
        expect(handleSessionTraits).toHaveBeenCalled()
        expect(handleScreenRecords).toHaveBeenCalled()

        expect(terminateEventRecording).not.toHaveBeenCalled()
        expect(terminateVideoRecording).not.toHaveBeenCalled()
      })

      it('records events BUT no videos', async () => {
        const collector = installer()
          .withFetch(
            mockFetchCollectionSettings({
              sessionRecording: true,
              videoRecording: false,
              snapshotRecording: false,
              videoAnonymization: true,
              anonymizeSelectors: undefined,
              ignoreSelectors: undefined,
            }),
          )
          .install()

        await emitEachEventKind(collector)
        expect(handleSessionUserActions).toHaveBeenCalled()
        expect(handleSessionTraits).toHaveBeenCalled()
        expect(handleScreenRecords).not.toHaveBeenCalled()

        expect(terminateEventRecording).not.toHaveBeenCalled()
        expect(terminateVideoRecording).toHaveBeenCalled()
      })

      it('records anonymized videos', async () => {
        const collector = installer()
          .withFetch(
            mockFetchCollectionSettings({
              sessionRecording: true,
              videoRecording: true,
              snapshotRecording: true,
              videoAnonymization: true,
              anonymizeSelectors: undefined,
              ignoreSelectors: undefined,
            }),
          )
          .install()

        await emitEachEventKind(collector)
        expect(getLastCallFirstArgument(initializeScreenRecording).enableAnonymization).toBeTruthy()
      })

      it('records non-anonymized videos', async () => {
        const collector = installer()
          .withFetch(
            mockFetchCollectionSettings({
              sessionRecording: true,
              videoRecording: true,
              snapshotRecording: true,
              videoAnonymization: false,
              anonymizeSelectors: undefined,
              ignoreSelectors: undefined,
            }),
          )
          .install()

        await emitEachEventKind(collector)
        expect(getLastCallFirstArgument(initializeScreenRecording).enableAnonymization).toBeFalsy()
      })

      it('records nothing', async () => {
        const collector = installer()
          .withFetch(
            mockFetchCollectionSettings({
              sessionRecording: false,
              videoRecording: false,
              snapshotRecording: true,
              videoAnonymization: true,
              anonymizeSelectors: undefined,
              ignoreSelectors: undefined,
            }),
          )
          .install()

        await emitEachEventKind(collector)
        expect(handleSessionUserActions).not.toHaveBeenCalled()
        expect(handleSessionTraits).not.toHaveBeenCalled()
        expect(handleScreenRecords).not.toHaveBeenCalled()

        expect(terminateEventRecording).toHaveBeenCalled()
        expect(terminateVideoRecording).toHaveBeenCalled()
      })
    })

    describe('terminate recording', () => {
      it('if error received', async () => {
        const collector = installer().withFetch(mockFetchCollectionSettings(null)).install()

        await emitEachEventKind(collector)
        expect(handleSessionUserActions).not.toHaveBeenCalled()
        expect(handleSessionTraits).not.toHaveBeenCalled()
        expect(handleScreenRecords).not.toHaveBeenCalled()

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
        expect(handleScreenRecords).not.toHaveBeenCalled()

        expect(terminateEventRecording).toHaveBeenCalled()
        expect(terminateVideoRecording).toHaveBeenCalled()
      })
    })
  })
})

async function emitEachEventKind(collector: CollectorWrapper) {
  await collector.userActionHandler.handle(createDummy())
  await collector.sessionTraitHandler.handle('age', 42)
  await collector.screenRecorderHandler.handle(createDummy())
}

function mockFetchCollectionSettings(settings: SessionCollectionSettings | null) {
  if (settings === null) {
    return mockFetch<ReadSessionCollectionSettingsResponse>({
      responseBody: {
        error: ReadSessionCollectionSettingsError.accessDenied,
        settings: null,
      },
    })
  }
  return mockFetch<ReadSessionCollectionSettingsResponse>({
    responseBody: {
      error: null,
      settings,
    },
  })
}
