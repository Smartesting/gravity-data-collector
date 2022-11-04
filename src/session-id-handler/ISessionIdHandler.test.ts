import ISessionIdHandler from './ISessionIdHandler'
import { beforeEach, describe, it } from 'vitest'
import assert from 'assert'
import MemorySessionIdHandler from './MemorySessionIdHandler'
import SessionStorageSessionIdHandler from './SessionStorageSessionIdHandler'
import CookieSessionIdHandler from './CookieSessionIdHandler'

function iSessionIdHandlerContractTest(
    implementationName: string,
    makeSessionIdHandler: () => ISessionIdHandler,
    cleanup: () => void,
) {
    describe(implementationName, () => {
        let sessionIdHandler: ISessionIdHandler
        beforeEach(() => {
            cleanup()
            sessionIdHandler = makeSessionIdHandler()
        })

        describe('isSet', () => {
            it('returns false when no session id has been set', () => {
                assert.strictEqual(sessionIdHandler.isSet(), false)
            })

            it('returns true when a session id has been set', () => {
                sessionIdHandler.set('abcd')
                assert.strictEqual(sessionIdHandler.isSet(), true)
            })
        })

        describe('get', () => {
            it('throws an error when no session id has been set', () => {
                assert.throws(() => sessionIdHandler.get(), new Error('Set session id before using it'))
            })

            it('returns the session when it has been set', () => {
                const sessionId = 'abcd'
                sessionIdHandler.set(sessionId)
                assert.strictEqual(sessionIdHandler.get(), sessionId)
            })
        })
    })
}

iSessionIdHandlerContractTest(
    'MemorySessionIdHandler',
    () => new MemorySessionIdHandler(),
    () => {
    },
)

iSessionIdHandlerContractTest(
    'SessionStorageSessionIdHandler',
    () => new SessionStorageSessionIdHandler(),
    () => sessionStorage.clear(),
)

iSessionIdHandlerContractTest(
    'CookieSessionIdHandler',
    () => new CookieSessionIdHandler(),
    clearCookies,
)

function clearCookies() {
    document.cookie.split(';').forEach(function (c) {
        document.cookie = c.replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
    })
}
