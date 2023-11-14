import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest'
import { collectorInstaller } from './CollectorInstaller'
import { v4 as uuid } from 'uuid'
import { nop } from '../utils/nop'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'
import ConsoleGravityClient from '../gravity-client/ConsoleGravityClient'
import { ReadSessionCollectionSettingsResponse } from '../types'
import CollectorWrapper from './CollectorWrapper'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import { mockFetch } from '../test-utils/mocks'
import { createDummy } from '../test-utils/dummyFactory'

describe('Session recording (event & video) depends on remote Gravity settings', () => {
  let initializeEventListeners: SpyInstance<[], void>
  let initializeScreenRecording: SpyInstance<[], void>

  beforeEach(() => {
    initializeEventListeners = vi.spyOn(EventListenersHandler.prototype, 'initializeEventListeners')
    initializeScreenRecording = vi.spyOn(ScreenRecorderHandler.prototype, 'initializeRecording').mockImplementation(nop)
  })

  afterEach(() => {
    initializeEventListeners.mockReset()
    initializeScreenRecording.mockReset()
  })

  describe('on dry run mode (debug=true)', () => {
    const installer = () => collectorInstaller({ requestInterval: 0, debug: true })
    let handleSessionUserActions: SpyInstance
    let handleSessionTraits: SpyInstance
    let handleScreenRecords: SpyInstance
    let terminateEventRecording: SpyInstance
    let terminateVideoRecording: SpyInstance

    beforeEach(() => {
      handleSessionUserActions = vi
        .spyOn(ConsoleGravityClient.prototype, 'handleSessionUserActions')
        .mockImplementation(async () => await Promise.resolve({ error: null }))
      handleSessionTraits = vi
        .spyOn(ConsoleGravityClient.prototype, 'handleSessionTraits')
        .mockImplementation(async () => await Promise.resolve({ error: null }))
      handleScreenRecords = vi
        .spyOn(ConsoleGravityClient.prototype, 'handleScreenRecords')
        .mockImplementation(async () => await Promise.resolve({ error: null }))
      terminateEventRecording = vi.spyOn(EventListenersHandler.prototype, 'terminateEventListeners')
      terminateVideoRecording = vi.spyOn(ScreenRecorderHandler.prototype, 'terminateRecording')
    })

    afterEach(() => {
      handleSessionUserActions.mockRestore()
      handleSessionTraits.mockRestore()
      handleScreenRecords.mockRestore()
      terminateEventRecording.mockRestore()
      terminateVideoRecording.mockRestore()
    })

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
    const installer = () => collectorInstaller({ requestInterval: 0, debug: false, authKey: uuid() })
    let handleSessionUserActions: SpyInstance
    let handleSessionTraits: SpyInstance
    let handleScreenRecords: SpyInstance
    let terminateEventRecording: SpyInstance
    let terminateVideoRecording: SpyInstance

    beforeEach(() => {
      handleSessionUserActions = vi
        .spyOn(HttpGravityClient.prototype, 'handleSessionUserActions')
        .mockImplementation(async () => await Promise.resolve({ error: null }))
      handleSessionTraits = vi
        .spyOn(HttpGravityClient.prototype, 'handleSessionTraits')
        .mockImplementation(async () => await Promise.resolve({ error: null }))
      handleScreenRecords = vi
        .spyOn(HttpGravityClient.prototype, 'handleScreenRecords')
        .mockImplementation(async () => await Promise.resolve({ error: null }))
      terminateEventRecording = vi.spyOn(EventListenersHandler.prototype, 'terminateEventListeners')
      terminateVideoRecording = vi.spyOn(ScreenRecorderHandler.prototype, 'terminateRecording')
    })

    afterEach(() => {
      handleSessionUserActions.mockRestore()
      handleSessionTraits.mockRestore()
      handleScreenRecords.mockRestore()
      terminateEventRecording.mockRestore()
      terminateVideoRecording.mockRestore()
    })

    describe('use remote settings if available', () => {
      it('records events & video', async () => {
        const fetch = mockFetch<ReadSessionCollectionSettingsResponse>({
          responseBody: { error: null, settings: { sessionRecording: true, videoRecording: true } },
        })

        const collector = installer()
          .withFetch(fetch)
          .withOptions({ enableEventRecording: false, enableVideoRecording: false })
          .install()

        await emitEachEventKind(collector)
        expect(handleSessionUserActions).toHaveBeenCalled()
        expect(handleSessionTraits).toHaveBeenCalled()
        expect(handleScreenRecords).toHaveBeenCalled()

        expect(terminateEventRecording).not.toHaveBeenCalled()
        expect(terminateVideoRecording).not.toHaveBeenCalled()
      })

      it('records events BUT no videos', async () => {
        const fetch = mockFetch<ReadSessionCollectionSettingsResponse>({
          responseBody: { error: null, settings: { sessionRecording: true, videoRecording: false } },
        })
        const collector = installer()
          .withFetch(fetch)
          .withOptions({ enableEventRecording: true, enableVideoRecording: true })
          .install()

        await emitEachEventKind(collector)
        expect(handleSessionUserActions).toHaveBeenCalled()
        expect(handleSessionTraits).toHaveBeenCalled()
        expect(handleScreenRecords).not.toHaveBeenCalled()

        expect(terminateEventRecording).not.toHaveBeenCalled()
        expect(terminateVideoRecording).toHaveBeenCalled()
      })

      it('records nothing', async () => {
        const fetch = mockFetch<ReadSessionCollectionSettingsResponse>({
          responseBody: { error: null, settings: { sessionRecording: false, videoRecording: false } },
        })
        const collector = installer()
          .withFetch(fetch)
          .withOptions({ enableEventRecording: true, enableVideoRecording: true })
          .install()

        await emitEachEventKind(collector)
        expect(handleSessionUserActions).not.toHaveBeenCalled()
        expect(handleSessionTraits).not.toHaveBeenCalled()
        expect(handleScreenRecords).not.toHaveBeenCalled()

        expect(terminateEventRecording).toHaveBeenCalled()
        expect(terminateVideoRecording).toHaveBeenCalled()
      })
    })

    describe('else use options settings if available', () => {
      it('records events & video', async () => {
        const collector = installer()
          .withFetch(mockFetch({ responseBody: { error: 'Unavailable', settings: null } }))
          .withOptions({ enableEventRecording: true, enableVideoRecording: true })
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
          .withFetch(mockFetch({ responseBody: { error: 'Unavailable', settings: null } }))
          .withOptions({ enableEventRecording: true, enableVideoRecording: false })
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
          .withFetch(mockFetch({ responseBody: { error: 'Unavailable', settings: null } }))
          .withOptions({ enableEventRecording: false, enableVideoRecording: false })
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
      const collector = installer()
        .withFetch(mockFetch({ responseBody: { error: 'Unavailable', settings: null } }))
        .install()

      await emitEachEventKind(collector)
      expect(handleSessionUserActions).toHaveBeenCalled()
      expect(handleSessionTraits).toHaveBeenCalled()
      expect(handleScreenRecords).toHaveBeenCalled()

      expect(terminateEventRecording).not.toHaveBeenCalled()
      expect(terminateVideoRecording).not.toHaveBeenCalled()
    })
  })
})

async function emitEachEventKind(collector: CollectorWrapper) {
  await collector.userActionHandler.handle(createDummy())
  await collector.sessionTraitHandler.handle('age', 42)
  await collector.screenRecorderHandler.handle(createDummy())
}
