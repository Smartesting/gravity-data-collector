import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest'
import { collectorInstaller } from './CollectorInstaller'
import { nop } from '../utils/nop'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'
import ConsoleGravityClient from '../gravity-client/ConsoleGravityClient'
import CollectorWrapper from './CollectorWrapper'
import { createDummy } from '../test-utils/dummyFactory'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  IdentifySessionResponse,
  SessionTraits,
  SessionUserAction,
  TargetedUserAction,
} from '../types'
import { eventWithTime } from '@rrweb/types'
import { getLastCallFirstArgument } from '../test-utils/spies'
import MemoryTimeoutHandler from '../timeout-handler/MemoryTimeoutHandler'

describe.skip('Session timeout management', () => {
  let initializeEventListeners: SpyInstance
  let initializeScreenRecording: SpyInstance
  let handleSessionUserActions: SpyInstance<[ReadonlyArray<SessionUserAction>], Promise<AddSessionUserActionsResponse>>
  let handleSessionTraits: SpyInstance<[string, SessionTraits], Promise<IdentifySessionResponse>>
  let handleScreenRecords: SpyInstance<[string, ReadonlyArray<eventWithTime>], Promise<AddSessionRecordingResponse>>
  let terminateEventRecording: SpyInstance
  let terminateVideoRecording: SpyInstance

  beforeEach(() => {
    vi.useFakeTimers()
    initializeEventListeners = vi.spyOn(EventListenersHandler.prototype, 'initializeEventListeners')
    initializeScreenRecording = vi.spyOn(ScreenRecorderHandler.prototype, 'initializeRecording').mockImplementation(nop)
  })

  afterEach(() => {
    vi.useRealTimers()
    initializeEventListeners.mockRestore()
    initializeScreenRecording.mockRestore()
  })

  function installSpies() {
    handleSessionUserActions = vi
      .spyOn(ConsoleGravityClient.prototype, 'handleSessionUserActions')
      .mockResolvedValue({ error: null })
    handleSessionTraits = vi
      .spyOn(ConsoleGravityClient.prototype, 'handleSessionTraits')
      .mockResolvedValue({ error: null })
    handleScreenRecords = vi
      .spyOn(ConsoleGravityClient.prototype, 'handleScreenRecords')
      .mockResolvedValue({ error: null })
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
    const installer = () => collectorInstaller({ debug: true })

    beforeEach(() => installSpies())
    afterEach(uninstallSpies)

    it('flush events if timeout is handled', async () => {
      let count = 1
      const collector = installer()
        .withOptions({ requestInterval: 300 })
        .withSessionIdHandler(new MemorySessionIdHandler(() => `sessionId-${count++}`))
        .withTimeoutHandler(new MemoryTimeoutHandler(1000))
        .install()
      initializeScreenRecording.mockClear()

      // requestInterval #1 => flush SessionStarted
      await vi.advanceTimersByTimeAsync(300)
      expect(handleSessionUserActions).toHaveBeenCalledTimes(1)

      // requestInterval #2 => nothing to flush
      await vi.advanceTimersByTimeAsync(300)
      expect(handleSessionUserActions).toHaveBeenCalledTimes(1)

      // requestInterval #3 => nothing to flush
      await vi.advanceTimersByTimeAsync(300)
      expect(handleSessionUserActions).toHaveBeenCalledTimes(1)

      console.log('emit 1')
      await emitEachEventKind(collector, 'burst-1')

      // requestInterval #4 => flush burst-1
      await vi.advanceTimersByTimeAsync(300)
      expect(handleSessionUserActions).toHaveBeenCalledTimes(2)
      expect(getLastCallFirstArgument(handleSessionUserActions)).toStrictEqual([
        { sessionId: 'sessionId-1', target: { element: 'burst-1' } },
      ])

      await collector.userActionHandler.handle(createDummy())
      // screenRecordingHandler has been reset
      expect(initializeScreenRecording).toHaveBeenCalledOnce()

      // requestInterval #5 => flush dummy userAction
      await vi.advanceTimersByTimeAsync(300)
      expect(handleSessionUserActions).toHaveBeenCalledTimes(3)

      console.log('emit 2')
      await emitEachEventKind(collector, 'burst-2')

      // requestInterval #6 => flush
      await vi.advanceTimersByTimeAsync(300)
      expect(handleSessionUserActions).toHaveBeenCalledTimes(4)
      expect(getLastCallFirstArgument(handleSessionUserActions)).toStrictEqual([
        { sessionId: 'sessionId-2', target: { element: 'burst-2' } },
      ])
    })
  })
})

async function emitEachEventKind(collector: CollectorWrapper, tag: string) {
  await collector.userActionHandler.handle(createDummy<TargetedUserAction>({ target: { element: tag } }))
  await collector.sessionTraitHandler.handle('id', tag)
  await collector.screenRecorderHandler.handle(createDummy<eventWithTime>({ data: tag }))
}
