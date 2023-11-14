import { v4 as uuidv4, v4 as uuid } from 'uuid'
import { Listener, SessionTraitValue, UserAction, UserActionType } from '../types'
import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest'
import { CollectorInstaller, collectorInstaller } from './CollectorInstaller'
import UserActionHandler from '../user-action/UserActionHandler'
import { asyncNop, nop } from '../utils/nop'
import { getLastCallArgument } from '../test-utils/spies'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import TestNameHandler from '../test-name-handler/TestNameHandler'
import { mock } from 'vitest-mock-extended'
import ClickEventListener from '../event-listeners/ClickEventListener'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import CypressEventListener from '../event-listeners/CypressEventListener'
import { Class } from '../test-utils/types'
import { IEventListener } from '../event-listeners/IEventListener'
import { AssertionError } from 'assert'
import SessionTraitHandler from '../session-trait/SessionTraitHandler'
import { mockFetch } from '../test-utils/mocks'

function contractTest(context: string, installer: () => CollectorInstaller) {
  describe(`GravityCollector.init() in ${context}`, () => {
    let handleUserAction: SpyInstance<[UserAction], Promise<void>>
    let handleSessionTrait: SpyInstance<[string, SessionTraitValue], Promise<void>>

    beforeEach(() => {
      handleUserAction = vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(asyncNop)
      handleSessionTrait = vi.spyOn(SessionTraitHandler.prototype, 'handle').mockImplementation(asyncNop)
      global.fetch = vi.fn()
    })

    afterEach(() => {
      handleUserAction.mockReset()
      handleSessionTrait.mockReset()
    })

    it('a "sessionStarted" action is sent when initialized', async () => {
      installer().install()
      expect(handleUserAction).toHaveBeenCalledOnce()
      expect(getLastCallArgument(handleUserAction).type).toBe(UserActionType.SessionStarted)
    })

    it('does not send "sessionStarted" action if session id exists', async () => {
      const sessionIdHandler = new MemorySessionIdHandler(uuid, 1000)
      installer().withSessionIdHandler(sessionIdHandler).install()
      expect(handleUserAction).toHaveBeenCalledOnce()
      const sessionId = sessionIdHandler.get()

      handleUserAction.mockReset()
      installer().withSessionIdHandler(sessionIdHandler).install()
      expect(handleUserAction).not.toHaveBeenCalled()
      expect(sessionIdHandler.get()).toEqual(sessionId)
    })

    it('a "sessionStarted" action is sent if session id exists but this is a new test', async () => {
      const sessionIdHandler = new MemorySessionIdHandler(uuid, 1000)
      const testNameHandler = mock<TestNameHandler>()
      testNameHandler.isNewTest.mockReturnValue(false)
      installer().withSessionIdHandler(sessionIdHandler).withTestNameHandler(testNameHandler).install()
      expect(handleUserAction).toHaveBeenCalledOnce()
      const sessionId = sessionIdHandler.get()

      handleUserAction.mockReset()
      testNameHandler.isNewTest.mockReturnValue(true)
      installer().withSessionIdHandler(sessionIdHandler).withTestNameHandler(testNameHandler).install()
      expect(handleUserAction).toHaveBeenCalledOnce()
      expect(getLastCallArgument(handleUserAction).type).toBe(UserActionType.SessionStarted)
      expect(sessionIdHandler.get()).not.toEqual(sessionId)
    })

    describe('event listener initializing', () => {
      interface ListenerTestData {
        listenerClass: Class<IEventListener>
        listenerOption: Listener
      }

      const LISTENERS: ListenerTestData[] = [
        { listenerClass: ClickEventListener, listenerOption: Listener.Click },
        { listenerClass: KeyUpEventListener, listenerOption: Listener.KeyUp },
        { listenerClass: KeyDownEventListener, listenerOption: Listener.KeyDown },
        { listenerClass: ChangeEventListener, listenerOption: Listener.Change },
        { listenerClass: BeforeUnloadEventListener, listenerOption: Listener.BeforeUnload },
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

    it('does not initialize CypressEventListener when window.Cypress is not available', async () => {
      vi.spyOn(CypressEventListener.prototype, 'init').mockImplementation(nop)
      installer().install()
      expect(CypressEventListener.prototype.init).not.toHaveBeenCalledOnce()
    })

    describe('when window.Cypress is available', () => {
      beforeEach(() => {
        ;(window as any).Cypress = {}
      })

      afterEach(() => {
        delete (window as any).Cypress
      })

      describe('initializes CypressEventListener:', () => {
        it('if enabledListeners option is not set ', async () => {
          vi.spyOn(CypressEventListener.prototype, 'init').mockImplementation(nop)
          installer().install()
          expect(CypressEventListener.prototype.init).toHaveBeenCalledOnce()
        })

        it('if enabledListeners option is set and includes CypressCommands', async () => {
          vi.spyOn(CypressEventListener.prototype, 'init').mockImplementation(nop)
          installer()
            .withOptions({ enabledListeners: [Listener.CypressCommands] })
            .install()
          expect(CypressEventListener.prototype.init).toHaveBeenCalledOnce()
        })
      })

      describe('does not initialize CypressEventListener:', () => {
        it('if enabledListeners option is set but does not include CypressCommands', async () => {
          vi.spyOn(CypressEventListener.prototype, 'init').mockImplementation(nop)
          installer().withOptions({ enabledListeners: [] }).install()
          expect(CypressEventListener.prototype.init).not.toHaveBeenCalled()
        })
      })
    })

    describe('when recordRequestsFor is not set and originsToRecord is set', () => {
      beforeEach(async () => {
        installer()
          .withOptions({ originsToRecord: ['https://server.com'] })
          .install()
        handleUserAction.mockReset() // clear first startedSession event
      })

      it('records the request when a fetch is made with a URL origin that can be recorded', async () => {
        await fetch('https://server.com/example', {
          method: 'GET',
        })
        expect(handleUserAction).toHaveBeenCalledOnce()
        expect(getLastCallArgument(handleUserAction)).toMatchObject({
          type: UserActionType.AsyncRequest,
          url: 'https://server.com/example',
          method: 'GET',
        })

        handleUserAction.mockReset()
        await fetch('https://notrecorded.com/example', {
          method: 'GET',
        })
        expect(handleUserAction).not.toHaveBeenCalled()
      })

      it('records the request when a XHR is made with a URL origin that can be recorded', async () => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', 'https://server.com/example')
        expect(handleUserAction).toHaveBeenCalled()
        expect(getLastCallArgument(handleUserAction)).toMatchObject({
          type: UserActionType.AsyncRequest,
          url: 'https://server.com/example',
          method: 'GET',
        })

        handleUserAction.mockReset()
        xhr.open('GET', 'https://notrecorded.com/example')
        expect(handleUserAction).not.toHaveBeenCalled()
      })
    })

    describe('when recordRequestsFor is set', () => {
      describe('and originsToRecord is set', () => {
        beforeEach(async () => {
          installer()
            .withOptions({
              gravityServerUrl: 'https://gravity-server.com',
              recordRequestsFor: ['https://server.com', 'https://gravity-server.com'],
              originsToRecord: ['https://deprecated.com'],
            })
            .withFetch(mockFetch())
            .install()
          handleUserAction.mockReset() // clear first startedSession event
        })

        it('uses recordRequestsFor option rather than originsToRecord option to determine if the request should be recorded when a fetch is made', async () => {
          await fetch('https://deprecated.com/example', {
            method: 'GET',
          })
          expect(handleUserAction).not.toHaveBeenCalled()

          await fetch('https://server.com/example', {
            method: 'GET',
          })

          expect(handleUserAction).toHaveBeenCalled()
          expect(getLastCallArgument(handleUserAction)).toMatchObject({
            type: UserActionType.AsyncRequest,
            url: 'https://server.com/example',
            method: 'GET',
          })
        })

        it('uses recordRequestsFor option rather than originsToRecord option to determine if the request should be recorded when a XHR is made', async () => {
          const xhr = new XMLHttpRequest()
          xhr.open('GET', 'https://deprecated.com/example')
          expect(handleUserAction).not.toHaveBeenCalled()

          xhr.open('GET', 'https://server.com/example')
          expect(handleUserAction).toHaveBeenCalled()
          expect(getLastCallArgument(handleUserAction)).toMatchObject({
            type: UserActionType.AsyncRequest,
            url: 'https://server.com/example',
            method: 'GET',
          })
        })
      })

      describe('and originsToRecord is not set', () => {
        beforeEach(async () => {
          installer()
            .withOptions({
              gravityServerUrl: 'https://gravity-server.com',
              recordRequestsFor: ['https://server.com', 'https://gravity-server.com'],
            })
            .withFetch(mockFetch())
            .install()
          handleUserAction.mockReset() // clear first startedSession event
        })

        it('records the request when a fetch is made with a URL origin that can be recorded', async () => {
          await fetch('https://server.com/example', {
            method: 'GET',
          })
          expect(handleUserAction).toHaveBeenCalledOnce()
          expect(getLastCallArgument(handleUserAction)).toMatchObject({
            type: UserActionType.AsyncRequest,
            url: 'https://server.com/example',
            method: 'GET',
          })

          handleUserAction.mockReset()
          await fetch('https://notrecorded.com/example', {
            method: 'GET',
          })
          expect(handleUserAction).not.toHaveBeenCalled()
        })

        it('records the request when a XHR is made with a URL origin that can be recorded', async () => {
          const xhr = new XMLHttpRequest()
          xhr.open('GET', 'https://server.com/example')
          expect(handleUserAction).toHaveBeenCalled()
          expect(getLastCallArgument(handleUserAction)).toMatchObject({
            type: UserActionType.AsyncRequest,
            url: 'https://server.com/example',
            method: 'GET',
          })

          handleUserAction.mockReset()
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
    })

    describe('tracking is active for the current session according option "sessionsPercentageKept"', () => {
      it('should always track if percentage is 100', async () => {
        const collector = installer().withOptions({ sessionsPercentageKept: 100 }).install()
        expect(handleUserAction).toHaveBeenCalledOnce()
        collector.identifySession('logged', true)
        expect(handleSessionTrait).toHaveBeenCalledOnce()
      })

      it('should never track if percentage is 0', async () => {
        const collector = installer().withOptions({ sessionsPercentageKept: 0 }).install()
        expect(handleUserAction).not.toHaveBeenCalled()
        collector.identifySession('logged', true)
        expect(handleSessionTrait).not.toHaveBeenCalled()
      })

      it('should continue tracking if collector is reset while the same session', async () => {
        const sessionIdHandler = new MemorySessionIdHandler(uuidv4, 1000)
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

        collector.identifySession('logged', true)
        expect(handleSessionTrait).toHaveBeenCalledOnce()
      })

      // flaky test ??
      it('should collect percentage/100 from N sessions (if N is large enough...) ', async () => {
        const sessionsPercentageKept = 10
        const max = 1000

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

    describe('option "rejectSession" allows to:', () => {
      it('reject session if rejectSession is positive', async () => {
        const collector = installer()
          .withOptions({ rejectSession: () => true })
          .install()

        expect(handleUserAction).not.toHaveBeenCalled()
        collector.identifySession('logged', true)
        expect(handleSessionTrait).not.toHaveBeenCalled()
      })

      it('keep session if rejectSession is negative', async () => {
        const collector = installer()
          .withOptions({ rejectSession: () => false })
          .install()

        expect(handleUserAction).toHaveBeenCalled()
        collector.identifySession('logged', true)
        expect(handleSessionTrait).toHaveBeenCalled()
      })
    })
  })
}

contractTest('dry run mode (debug=true)', () => {
  return collectorInstaller({ debug: true })
})
contractTest('live mode (debug=false)', () => {
  return collectorInstaller({ debug: false, authKey: uuid() })
})
