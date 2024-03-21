import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi, vitest } from 'vitest'
import { collectorInstaller } from './CollectorInstaller'
import { asyncNop, nop } from '../utils/nop'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'
import ConsoleGravityClient from '../gravity-client/ConsoleGravityClient'
import CollectorWrapper from './CollectorWrapper'
import { createDummy } from '../test-utils/dummyFactory'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import {
  ReadSessionCollectionSettingsResponse,
  SessionTraits,
  SessionUserAction,
  TargetedUserAction,
  UserActionType,
} from '../types'
import { eventWithTime } from '@rrweb/types'
import MemoryTimeoutHandler from '../timeout-handler/MemoryTimeoutHandler'
import { uuid } from '../utils/uuid'
import AbstractGravityClient from '../gravity-client/AbstractGravityClient'
import { waitFor } from '@testing-library/dom'
import { getLastCallFirstArgument } from '../test-utils/spies'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import { mockFetch } from '../test-utils/mocks'
import CookieTimeoutHandler from '../timeout-handler/CookieTimeoutHandler'

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
      collectorInstaller({
        debug: false,
        authKey: uuid(),
      }).withFetch(
        mockFetch<ReadSessionCollectionSettingsResponse>({
          responseBody: {
            error: null,
            settings: {
              sessionRecording: true,
              videoRecording: true,
              snapshotRecording: true,
              videoAnonymization: true,
              anonymizeSelectors: undefined,
              ignoreSelectors: undefined,
            },
          },
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
      .withOptions({ requestInterval: 300 })
      .withSessionIdHandler(new MemorySessionIdHandler(() => `sessionId-${count++}`))
      .withTimeoutHandler(new MemoryTimeoutHandler(1000))
      .install()

    // requestInterval #1 => flush SessionStarted
    await vi.advanceTimersByTimeAsync(300)
    expect(handleSessionUserActions).toHaveBeenCalledTimes(1)

    // requestInterval #2 => nothing to flush
    await vi.advanceTimersByTimeAsync(300)
    expect(handleSessionUserActions).toHaveBeenCalledTimes(1)

    // requestInterval #3 => nothing to flush
    await vi.advanceTimersByTimeAsync(300)
    expect(handleSessionUserActions).toHaveBeenCalledTimes(1)

    // first user event emits (wave #1)
    await emitEachEventKind(collector, 'wave-1')

    // requestInterval #4 => flush wave-1
    await vi.advanceTimersByTimeAsync(300)
    expect(handleSessionUserActions).toHaveBeenCalledTimes(2)
    expect(handleSessionUserActions.mock.lastCall).toStrictEqual([
      [
        {
          sessionId: 'sessionId-1',
          target: { element: 'wave-1' },
          location: {},
        },
      ],
    ])
    expect(handleSessionTraits.mock.lastCall).toStrictEqual(['sessionId-1', { id: 'wave-1' }])
    expect(handleScreenRecords.mock.lastCall).toStrictEqual(['sessionId-1', [{ data: 'wave-1' }]])

    await vi.advanceTimersByTimeAsync(2000)
    await collector.userActionHandler.handle(
      createDummy<TargetedUserAction>({ target: { element: 'handlingExpirationEvent' } }),
    )

    // requestInterval #5 => flush dummy userAction
    // the session has expired :
    // - ScreenRecorderHandler must have been reset
    // - EventListenersHandler must have been reset
    // the expired event is not saved
    await vi.advanceTimersByTimeAsync(300)
    expect(initializeScreenRecording).toHaveBeenCalledTimes(2)
    expect(initializeEventListeners).toHaveBeenCalledTimes(2)
    expect(handleSessionUserActions).toHaveBeenCalledTimes(3)
    expect(handleSessionUserActions.mock.lastCall).toMatchObject([
      [
        {
          type: UserActionType.SessionStarted,
          sessionId: 'sessionId-2',
        },
      ],
    ])

    // second user event emits (wave #2)
    await emitEachEventKind(collector, 'wave-2')

    // requestInterval #6 => flush
    await vi.advanceTimersByTimeAsync(300)
    expect(handleSessionUserActions).toHaveBeenCalledTimes(4)
    expect(handleSessionUserActions.mock.lastCall).toMatchObject([
      [
        {
          sessionId: 'sessionId-2',
          target: { element: 'wave-2' },
        },
      ],
    ])
    expect(handleSessionTraits.mock.lastCall).toStrictEqual(['sessionId-2', { id: 'wave-2' }])
    expect(handleScreenRecords.mock.lastCall).toStrictEqual(['sessionId-2', [{ data: 'wave-2' }]])
  })
})

const memorySessionIdHandler = new MemorySessionIdHandler(uuid)
const memoryTimeoutHandler = new MemoryTimeoutHandler(1000)
const cookieTimeoutHandler = new CookieTimeoutHandler(1000, global.window)
describe.each([
  {
    context: 'with memory-based timeout',
    timeoutHandler: memoryTimeoutHandler,
    installer: () =>
      collectorInstaller({ authKey: uuid() })
        .withSessionIdHandler(memorySessionIdHandler)
        .withTimeoutHandler(memoryTimeoutHandler),
  },
  {
    context: 'with cookie-based timeout',
    timeoutHandler: cookieTimeoutHandler,
    installer: () =>
      collectorInstaller({
        authKey: uuid(),
      })
        .withCookieSessionIdHandler()
        .withTimeoutHandler(cookieTimeoutHandler),
  },
])('timeout in context $context', ({ installer, timeoutHandler }) => {
  let handleUserAction: SpyInstance<[SessionUserAction], Promise<void>>
  let handleSessionTrait: SpyInstance<[string, SessionTraits], Promise<void>>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })

    handleUserAction = vi.spyOn(AbstractGravityClient.prototype, 'addSessionUserAction').mockImplementation(asyncNop)
    handleSessionTrait = vi.spyOn(AbstractGravityClient.prototype, 'identifySession').mockImplementation(asyncNop)
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()

    handleUserAction.mockRestore()
    handleSessionTrait.mockRestore()
  })

  it('is reused for a new collector, expiration is preserved', async () => {
    installer().install()
    await waitFor(() => expect(handleUserAction).toBeCalled())
    const firstInstallationSessionId = getLastCallFirstArgument(handleUserAction).sessionId

    vi.advanceTimersByTime(5000)

    installer().install()
    await waitFor(() => expect(handleUserAction).toBeCalledTimes(2))
    const secondInstallationSessionId = getLastCallFirstArgument(handleUserAction).sessionId

    assert.notEqual(firstInstallationSessionId, secondInstallationSessionId)
  })

  it('is reset when a user action is handled', async () => {
    const spy = vitest.spyOn(timeoutHandler, 'reset')
    const collector = installer().install()
    await collector.userActionHandler.handle(createDummy<TargetedUserAction>({ target: { element: 'div' } }))

    expect(spy).toBeCalled()
  })
})

async function emitEachEventKind(collector: CollectorWrapper, tag: string) {
  await collector.userActionHandler.handle(createDummy<TargetedUserAction>({ target: { element: tag } }))
  await collector.sessionTraitHandler.handle('id', tag)
  await collector.screenRecorderHandler.handle(createDummy<eventWithTime>({ data: tag }))
}
