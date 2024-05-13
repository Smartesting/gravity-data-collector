import {
  CollectorOptions,
  GravityRecordingSettingsResponse,
  Listener,
  SessionTraits,
  SessionUserAction,
  UserActionType,
} from '../types'
import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest'
import { collectorInstaller } from './CollectorInstaller'
import { asyncNop, nop } from '../utils/nop'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import ClickEventListener from '../event-listeners/ClickEventListener'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import { Class } from '../test-utils/types'
import { IEventListener } from '../event-listeners/IEventListener'
import { AssertionError } from 'assert'
import { buildGravityRecordingSettingsResponse, mockFetch } from '../test-utils/mocks'
import AbstractGravityClient from '../gravity-client/AbstractGravityClient'
import * as rrweb from 'rrweb'
import { uuid } from '../utils/uuid'
import { getLastCallFirstArgument } from '../test-utils/spies'
import ContextMenuEventListener from '../event-listeners/ContextMenuEventListener'
import CopyEventListener from '../event-listeners/CopyEventListener'
import CutEventListener from '../event-listeners/CutEventListener'
import DblClickEventListener from '../event-listeners/DblClickEventListener'
import DragStartEventListener from '../event-listeners/DragStartEventListener'
import DropEventListener from '../event-listeners/DropEventListener'
import PlayEventListener from '../event-listeners/PlayEventListener'
import PauseEventListener from '../event-listeners/PauseEventListener'
import SeekedEventListener from '../event-listeners/SeekedEventListener'
import PasteEventListener from '../event-listeners/PasteEventListener'
import FullScreenChangeEventListener from '../event-listeners/FullScreenChangeEventListener'
import HashChangeEventListener from '../event-listeners/HashChangeEventListener'
import { waitFor } from '@testing-library/dom'
import FocusEventListener from '../event-listeners/FocusEventListener'
import BlurEventListener from '../event-listeners/BlurEventListener'
import SubmitEventListener from '../event-listeners/SubmitEventListener'
import ResetEventListener from '../event-listeners/ResetEventListener'
import ScrollEventListener from '../event-listeners/ScrollEventListener'
import ResizeEventListener from '../event-listeners/ResizeEventListener'
import SelectEventListener from '../event-listeners/SelectEventListener'
import ToggleEventListener from '../event-listeners/ToggleEventListener'
import TouchStartEventListener from '../event-listeners/TouchStartEventListener'
import TouchMoveEventListener from '../event-listeners/TouchMoveEventListener'
import TouchEndEventListener from '../event-listeners/TouchEndEventListener'
import TouchCancelEventListener from '../event-listeners/TouchCancelEventListener'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import ConsoleGravityClient from '../gravity-client/ConsoleGravityClient'
import GravityCollector from './GravityCollector'
import sinon from 'sinon'
import { v4 as uuidv4 } from 'uuid'

describe.each([
  {
    context: 'dry run mode (debug=true)',
    installer: (opts?: Partial<CollectorOptions>) => collectorInstaller({ ...opts, debug: true }),
    clientClass: ConsoleGravityClient,
  },
  {
    context: 'live mode (debug=false)',
    installer: (opts?: Partial<CollectorOptions>) =>
      collectorInstaller({
        ...opts,
        debug: false,
        authKey: uuid(),
      }),
    clientClass: HttpGravityClient,
  },
])('GravityCollector.init() in $context', ({ installer, clientClass }) => {
  let handleUserAction: SpyInstance<[SessionUserAction], Promise<void>>
  let handleSessionTrait: SpyInstance<[string, SessionTraits], Promise<void>>

  beforeEach(() => {
    handleUserAction = vi.spyOn(AbstractGravityClient.prototype, 'addSessionUserAction').mockImplementation(asyncNop)
    handleSessionTrait = vi.spyOn(AbstractGravityClient.prototype, 'identifySession').mockImplementation(asyncNop)
    vi.spyOn(clientClass.prototype, 'readSessionCollectionSettings').mockResolvedValue(
      buildGravityRecordingSettingsResponse({
        videoRecording: true,
        snapshotRecording: true,
      }),
    )
  })

  afterEach(() => {
    handleUserAction.mockRestore()
    handleSessionTrait.mockRestore()
  })

  it('a "sessionStarted" action is sent when initialized', async () => {
    installer().install()
    expect(handleUserAction).toHaveBeenCalledOnce()
    expect(getLastCallFirstArgument(handleUserAction).type).toBe(UserActionType.SessionStarted)
  })

  it('does not send "sessionStarted" action if session id exists', async () => {
    const sessionIdHandler = new MemorySessionIdHandler(uuid)
    installer().withSessionIdHandler(sessionIdHandler).install()
    expect(handleUserAction).toHaveBeenCalledOnce()
    const sessionId = sessionIdHandler.get()

    handleUserAction.mockClear()
    installer().withSessionIdHandler(sessionIdHandler).install()
    expect(handleUserAction).not.toHaveBeenCalled()
    expect(sessionIdHandler.get()).toEqual(sessionId)
  })

  describe('event listener initializing', () => {
    interface ListenerTestData {
      listenerClass: Class<IEventListener>
      listenerOption: Listener
    }

    const LISTENERS: ListenerTestData[] = [
      {
        listenerClass: ClickEventListener,
        listenerOption: Listener.Click,
      },
      {
        listenerClass: DblClickEventListener,
        listenerOption: Listener.DblClick,
      },
      {
        listenerClass: ContextMenuEventListener,
        listenerOption: Listener.ContextMenu,
      },
      {
        listenerClass: ChangeEventListener,
        listenerOption: Listener.Change,
      },
      {
        listenerClass: KeyUpEventListener,
        listenerOption: Listener.KeyUp,
      },
      {
        listenerClass: KeyDownEventListener,
        listenerOption: Listener.KeyDown,
      },
      {
        listenerClass: CopyEventListener,
        listenerOption: Listener.Copy,
      },
      {
        listenerClass: CutEventListener,
        listenerOption: Listener.Cut,
      },
      {
        listenerClass: PasteEventListener,
        listenerOption: Listener.Paste,
      },
      {
        listenerClass: SelectEventListener,
        listenerOption: Listener.Select,
      },
      {
        listenerClass: DragStartEventListener,
        listenerOption: Listener.DragStart,
      },
      {
        listenerClass: DropEventListener,
        listenerOption: Listener.Drop,
      },
      {
        listenerClass: PlayEventListener,
        listenerOption: Listener.Play,
      },
      {
        listenerClass: PauseEventListener,
        listenerOption: Listener.Pause,
      },
      {
        listenerClass: SeekedEventListener,
        listenerOption: Listener.Seeked,
      },
      {
        listenerClass: FullScreenChangeEventListener,
        listenerOption: Listener.FullScreenChange,
      },
      {
        listenerClass: ResizeEventListener,
        listenerOption: Listener.Resize,
      },
      {
        listenerClass: HashChangeEventListener,
        listenerOption: Listener.HashChange,
      },
      {
        listenerClass: FocusEventListener,
        listenerOption: Listener.Focus,
      },
      {
        listenerClass: BlurEventListener,
        listenerOption: Listener.Blur,
      },
      {
        listenerClass: SubmitEventListener,
        listenerOption: Listener.Submit,
      },
      {
        listenerClass: ResetEventListener,
        listenerOption: Listener.Reset,
      },
      {
        listenerClass: BeforeUnloadEventListener,
        listenerOption: Listener.BeforeUnload,
      },
      {
        listenerClass: ScrollEventListener,
        listenerOption: Listener.Scroll,
      },
      {
        listenerClass: ToggleEventListener,
        listenerOption: Listener.Toggle,
      },
      {
        listenerClass: TouchStartEventListener,
        listenerOption: Listener.TouchStart,
      },
      {
        listenerClass: TouchMoveEventListener,
        listenerOption: Listener.TouchMove,
      },
      {
        listenerClass: TouchEndEventListener,
        listenerOption: Listener.TouchEnd,
      },
      {
        listenerClass: TouchCancelEventListener,
        listenerOption: Listener.TouchCancel,
      },
    ]

    for (const { listenerClass, listenerOption } of LISTENERS) {
      describe(`${listenerClass.name}`, () => {
        describe('when options.enabledListeners is not specified', () => {
          it(`initializes ${listenerClass.name}`, async () => {
            vi.spyOn(listenerClass.prototype, 'init').mockImplementation(nop)
            installer().install()
            expect(listenerClass.prototype.init).toHaveBeenCalledOnce()
          })
        })

        describe('when options.enabledListeners is specified', () => {
          it(`does not initialize ${listenerClass.name} when ${listenerOption} is not present`, async () => {
            vi.spyOn(listenerClass.prototype, 'init').mockImplementation(nop)
            installer().withOptions({ enabledListeners: [] }).install()
            expect(listenerClass.prototype.init).not.toHaveBeenCalled()
          })

          it(`initializes ${listenerClass.name} when ${listenerOption} is present`, async () => {
            vi.spyOn(listenerClass.prototype, 'init').mockImplementation(nop)
            installer()
              .withOptions({ enabledListeners: [listenerOption] })
              .install()
            expect(listenerClass.prototype.init).toHaveBeenCalledOnce()
          })
        })
      })
    }
  })

  describe('when recordRequestsFor is set', () => {
    beforeEach(async () => {
      installer()
        .withOptions({
          gravityServerUrl: 'https://gravity-server.com',
          recordRequestsFor: ['https://server.com', 'https://gravity-server.com'],
        })
        .withFetch(mockFetch())
        .install()
      handleUserAction.mockClear() // clear first startedSession event
    })

    it('records the request when a fetch is made with a URL origin that can be recorded', async () => {
      await fetch('https://server.com/example', {
        method: 'GET',
      })
      expect(handleUserAction).toHaveBeenCalledOnce()
      expect(getLastCallFirstArgument(handleUserAction)).toMatchObject({
        type: UserActionType.AsyncRequest,
        url: 'https://server.com/example',
        method: 'GET',
      })

      handleUserAction.mockClear()
      await fetch('https://notrecorded.com/example', {
        method: 'GET',
      })
      expect(handleUserAction).not.toHaveBeenCalled()
    })

    it('records the request when a XHR is made with a URL origin that can be recorded', async () => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', 'https://server.com/example')
      expect(handleUserAction).toHaveBeenCalled()
      expect(getLastCallFirstArgument(handleUserAction)).toMatchObject({
        type: UserActionType.AsyncRequest,
        url: 'https://server.com/example',
        method: 'GET',
      })

      handleUserAction.mockClear()
      xhr.open('GET', 'https://notrecorded.com/example')
      expect(handleUserAction).not.toHaveBeenCalled()
    })

    it('does not record a tracking request from Gravity when a POST fetch is made', async () => {
      await fetch('https://gravity-server.com/api/tracking/abcd-efg/publish', {
        method: 'POST',
      })
      expect(handleUserAction).not.toHaveBeenCalled()
    })

    it('does not record a tracking request from Gravity when a POST XHR is made', async () => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', 'https://gravity-server.com/api/tracking/abcd-efg/publish')
      expect(handleUserAction).not.toHaveBeenCalled()
    })
  })

  describe('tracking is active for the current session according option "sessionsPercentageKept"', () => {
    it('should always track if percentage is 100', async () => {
      const collector = installer().withOptions({ sessionsPercentageKept: 100 }).install()
      expect(handleUserAction).toHaveBeenCalledOnce()
      await collector.identifySession('logged', true)
      expect(handleSessionTrait).toHaveBeenCalledOnce()
    })

    it('should never track if percentage is 0', async () => {
      const collector = installer().withOptions({ sessionsPercentageKept: 0 }).install()
      expect(handleUserAction).not.toHaveBeenCalled()
      await collector.identifySession('logged', true)
      expect(handleSessionTrait).not.toHaveBeenCalled()
    })

    it('should continue tracking if collector is reset while the same session', async () => {
      const sessionIdHandler = new MemorySessionIdHandler(uuid)
      installer().withSessionIdHandler(sessionIdHandler).withOptions({ sessionsPercentageKept: 100 }).install()
      expect(handleUserAction).toHaveBeenCalledOnce()
      expect(handleSessionTrait).not.toHaveBeenCalled()

      // act as a new random choice causing tracker disabling
      const collector = installer()
        .withSessionIdHandler(sessionIdHandler)
        .withOptions({ sessionsPercentageKept: 0 })
        .install()
      expect(handleUserAction).toHaveBeenCalledOnce()
      expect(handleSessionTrait).not.toHaveBeenCalled()

      await collector.identifySession('logged', true)
      expect(handleSessionTrait).toHaveBeenCalledOnce()
    })

    // flaky test ??
    it('should collect percentage/100 from N sessions (if N is large enough...) ', async () => {
      const sessionsPercentageKept = 10
      const max = 2000

      function isApproximation(candidate: number, target: number, tolerance: number) {
        return candidate >= target - tolerance && candidate <= target + tolerance
      }

      let countCollectedSessions: number = 0
      for (let i = 1; i <= max; i++) {
        installer().withOptions({ sessionsPercentageKept }).withFetch(mockFetch()).install()
        countCollectedSessions = handleUserAction.mock.calls.length
        const percentage = (100 * countCollectedSessions) / i
        if (i >= 100) {
          // wait for having at least 100 to compute a realistic percentage
          // console.log(countCollectedSessions, i, percentage)
          if (isApproximation(percentage, sessionsPercentageKept, 2)) return
        }
      }
      throw new AssertionError({
        message: `Expected ${sessionsPercentageKept}% sessions to be kept but got ${
          (100 * countCollectedSessions) / max
        }%`,
      })
    })
  })

  it('First video event must have same session id than first session event', async () => {
    const sessionIdHandler = new MemorySessionIdHandler(uuid)
    let initialSessionId: string | null = null
    const recordSpy = vi.spyOn(rrweb, 'record').mockImplementationOnce(() => {
      initialSessionId = sessionIdHandler.get()
      return nop
    })
    installer()
      .withSessionIdHandler(sessionIdHandler)
      .withFetch(
        mockFetch<GravityRecordingSettingsResponse>({
          responseBody: {
            error: null,
            settings: {
              sessionRecording: true,
              videoRecording: true,
              snapshotRecording: true,
              videoAnonymization: true,
              snapshotAnonymization: true,
              anonymizeSelectors: undefined,
              ignoreSelectors: undefined,
            },
          },
        }),
      )
      .install()
    await waitFor(() => expect(recordSpy).toBeCalled())
    assert.equal(getLastCallFirstArgument(handleUserAction).sessionId, initialSessionId)
  })

  describe('option "rejectSession" allows to:', () => {
    it('reject session if rejectSession is positive', async () => {
      const collector = installer()
        .withOptions({ rejectSession: () => true })
        .install()

      expect(handleUserAction).not.toHaveBeenCalled()
      await collector.identifySession('logged', true)
      expect(handleSessionTrait).not.toHaveBeenCalled()
    })

    it('keep session if rejectSession is negative', async () => {
      const collector = installer()
        .withOptions({ rejectSession: () => false })
        .install()

      expect(handleUserAction).toHaveBeenCalled()
      await collector.identifySession('logged', true)
      expect(handleSessionTrait).toHaveBeenCalled()
    })
  })
})

describe('when an instance already exist on the window object', () => {
  const fakeCollector = {
    collectorWrapper: {
      terminateRecording: () => {},
    },
  }

  const win: Window & typeof globalThis & { _GravityCollector?: any } = global.window

  beforeEach(() => {
    win._GravityCollector = fakeCollector
  })

  afterEach(() => {
    delete win._GravityCollector
  })

  it('GravityCollector.init does not override it', () => {
    GravityCollector.init({
      authKey: uuid(),
      window: win,
    })

    assert.deepStrictEqual(win._GravityCollector, fakeCollector)
  })

  describe('GravityCollector.initWithOverride', () => {
    it('overrides the existing collector', () => {
      GravityCollector.initWithOverride({
        authKey: uuid(),
        window: win,
      })

      assert(
        win._GravityCollector instanceof GravityCollector,
        'The created collector is an instance of GravityCollector',
      )
    })

    it('stops the recording on the existing collector', () => {
      const spyTerminateRecording = sinon.spy()
      fakeCollector.collectorWrapper.terminateRecording = spyTerminateRecording
      GravityCollector.initWithOverride({
        authKey: uuid(),
        window: win,
      })

      sinon.assert.calledOnceWithExactly(spyTerminateRecording, true, true, true)
    })

    it('forces usage of a new session', () => {
      GravityCollector.initWithOverride({
        authKey: uuid(),
        window: win,
      })
      const firstSessionId = GravityCollector.getSessionId(win)
      GravityCollector.initWithOverride({
        authKey: uuid(),
        window: win,
      })
      const secondSessionId = GravityCollector.getSessionId()

      assert(firstSessionId, 'First session ID was set')
      assert(secondSessionId, 'Second session ID is set')
      assert(firstSessionId !== secondSessionId, 'A new ID was generated')
    })

    it('uses the provided session id', () => {
      GravityCollector.initWithOverride({
        authKey: uuid(),
        window: win,
      })
      const firstSessionId = GravityCollector.getSessionId(win)
      const sessionId = uuidv4()
      GravityCollector.initWithOverride(
        {
          authKey: uuid(),
          window: win,
        },
        sessionId,
      )
      const secondSessionId = GravityCollector.getSessionId()

      assert(firstSessionId, 'First session ID was set')
      assert.strictEqual(secondSessionId, sessionId)
    })
  })
})
