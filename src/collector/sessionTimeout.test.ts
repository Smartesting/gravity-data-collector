import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest'
import { collectorInstaller } from './CollectorInstaller'
import { nop } from '../utils/nop'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'
import ConsoleGravityClient from '../gravity-client/ConsoleGravityClient'
import CollectorWrapper from './CollectorWrapper'
import { createDummy } from '../test-utils/dummyFactory'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import { ReadSessionCollectionSettingsResponse, TargetedUserAction, UserActionType } from '../types'
import { eventWithTime } from '@rrweb/types'
import MemoryTimeoutHandler from '../timeout-handler/MemoryTimeoutHandler'
import { uuid } from '../utils/uuid'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import { mockFetch } from '../test-utils/mocks'

describe.each([
  {
    context: 'dry run mode (debug=true)',
    clientClass: ConsoleGravityClient,
    installer: () => collectorInstaller({ debug: true }),
  },
  {
    context: 'live mode (debug=false)',
    clientClass: HttpGravityClient,
    installer: () =>
      collectorInstaller({ debug: false, authKey: uuid() }).withFetch(
        mockFetch<ReadSessionCollectionSettingsResponse>({
          responseBody: { error: null, settings: { sessionRecording: true, videoRecording: true } },
        }),
      ),
  },
])('Session timeout management on $context', ({ clientClass, installer }) => {
  let initializeEventListeners: SpyInstance
  let initializeScreenRecording: SpyInstance
  let handleSessionUserActions: SpyInstance
  let handleSessionTraits: SpyInstance
  let handleScreenRecords: SpyInstance

  beforeEach(() => {
    vi.useFakeTimers()
    initializeEventListeners = vi.spyOn(EventListenersHandler.prototype, 'initializeEventListeners')
    initializeScreenRecording = vi.spyOn(ScreenRecorderHandler.prototype, 'initializeRecording').mockImplementation(nop)
    handleSessionUserActions = vi
      .spyOn(clientClass.prototype, 'handleSessionUserActions')
      .mockResolvedValue({ error: null })
    handleSessionTraits = vi.spyOn(clientClass.prototype, 'handleSessionTraits').mockResolvedValue({ error: null })
    handleScreenRecords = vi.spyOn(clientClass.prototype, 'handleScreenRecords').mockResolvedValue({ error: null })
  })

  afterEach(() => {
    vi.useRealTimers()
    initializeEventListeners.mockRestore()
    initializeScreenRecording.mockRestore()
    handleSessionUserActions.mockRestore()
    handleSessionTraits.mockRestore()
    handleScreenRecords.mockRestore()
  })

  it('flush events if timeout is handled', async () => {
    let count = 1
    const collector = installer()
      .withOptions({ requestInterval: 300, enableVideoRecording: true })
      .withSessionIdHandler(new MemorySessionIdHandler(() => `sessionId-${count++}`))
      .withTimeoutHandler(new MemoryTimeoutHandler(1000))
      .install()
    initializeEventListeners.mockClear()
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

    // first user event emits (burst #1)
    await emitEachEventKind(collector, 'burst-1')

    // requestInterval #4 => flush burst-1
    await vi.advanceTimersByTimeAsync(300)
    expect(handleSessionUserActions).toHaveBeenCalledTimes(2)
    expect(handleSessionUserActions.mock.lastCall).toStrictEqual([
      [{ sessionId: 'sessionId-1', target: { element: 'burst-1' } }],
    ])
    expect(handleSessionTraits.mock.lastCall).toStrictEqual(['sessionId-1', { id: 'burst-1' }])
    expect(handleScreenRecords.mock.lastCall).toStrictEqual(['sessionId-1', [{ data: 'burst-1' }]])

    await collector.userActionHandler.handle(
      createDummy<TargetedUserAction>({ target: { element: 'handlingExpirationEvent' } }),
    )
    // the session has expired :
    // - ScreenRecorderHandler must have been reset
    // - EventListenersHandler must have been reset
    expect(initializeScreenRecording).toHaveBeenCalledOnce()
    expect(initializeEventListeners).toHaveBeenCalledOnce()

    // requestInterval #5 => flush dummy userAction
    await vi.advanceTimersByTimeAsync(300)
    expect(handleSessionUserActions).toHaveBeenCalledTimes(3)
    expect(handleSessionUserActions.mock.lastCall).toMatchObject([
      [
        {
          sessionId: 'sessionId-1',
          target: { element: 'handlingExpirationEvent' },
        },
        {
          type: UserActionType.SessionStarted,
          sessionId: 'sessionId-2',
        },
      ],
    ])

    // second user event emits (burst #2)
    await emitEachEventKind(collector, 'burst-2')

    // requestInterval #6 => flush
    await vi.advanceTimersByTimeAsync(300)
    expect(handleSessionUserActions).toHaveBeenCalledTimes(4)
    expect(handleSessionUserActions.mock.lastCall).toMatchObject([
      [{ sessionId: 'sessionId-2', target: { element: 'burst-2' } }],
    ])
    expect(handleSessionTraits.mock.lastCall).toStrictEqual(['sessionId-2', { id: 'burst-2' }])
    expect(handleScreenRecords.mock.lastCall).toStrictEqual(['sessionId-2', [{ data: 'burst-2' }]])
  })
})

async function emitEachEventKind(collector: CollectorWrapper, tag: string) {
  await collector.userActionHandler.handle(createDummy<TargetedUserAction>({ target: { element: tag } }))
  await collector.sessionTraitHandler.handle('id', tag)
  await collector.screenRecorderHandler.handle(createDummy<eventWithTime>({ data: tag }))
}
