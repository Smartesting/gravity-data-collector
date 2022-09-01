import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildGravityTrackingApiUrl,
  debugUserActionSessionSender,
  defaultUserActionSessionSender,
  GRAVITY_SERVER_ADDRESS,
  sendSessionUserActions,
} from './userActionSessionSender'
import { SessionUserAction } from '../types'
import { DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR, VALID_AUTH_KEY } from '../mocks/handlers'
import { waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'

describe('userActionSessionSender', () => {
  const action = {}
  const sessionActions: SessionUserAction[] = [action as SessionUserAction, action as SessionUserAction]

  describe('defaultUserActionSessionSender', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    const spySuccess = vi.fn()
    const spyError = vi.fn()

    it('sends session user actions if valid auth key', async () => {
      await defaultUserActionSessionSender(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, spySuccess)(sessionActions)
      await waitFor(() => {
        expect(spySuccess).toHaveBeenCalledWith({ error: null })
      })
    })

    it('catches error if invalid auth key', async () => {
      await defaultUserActionSessionSender(
        'DUMMY_AUTH_KEY',
        GRAVITY_SERVER_ADDRESS,
        spySuccess,
        spyError,
      )(sessionActions)
      await waitFor(() => {
        expect(spyError).toHaveBeenCalledWith('error 404, Not Found')
      })
    })

    it('catches any error', async () => {
      await defaultUserActionSessionSender(
        DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR,
        GRAVITY_SERVER_ADDRESS,
        spySuccess,
        spyError,
      )(sessionActions)
      await waitFor(() => {
        expect(spyError).toHaveBeenCalledOnce()
        expect((spyError.mock.lastCall as any[])[0]).toMatch(/request to (.+?) failed, reason: Network Error/)
      })
    })
  })

  describe('debugUserActionSessionSender', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.clearAllTimers()
      vi.restoreAllMocks()
    })
    const spyOutput = vi.fn()

    it('outputs session user actions immediately if no maxDelay', () => {
      debugUserActionSessionSender(0, spyOutput)(sessionActions)
      expect(spyOutput).toHaveBeenCalledTimes(3)
    })

    it('outputs session user actions immediately if maxDelay', () => {
      debugUserActionSessionSender(5000, spyOutput)(sessionActions)
      expect(spyOutput).toHaveBeenCalledTimes(0)
      vi.advanceTimersByTime(5000)
      expect(spyOutput).toHaveBeenCalledTimes(3)
    })
  })

  describe('sendSessionUserActions', () => {
    it('sets the `Origin` header when a source is provided', async () => {
      const fetch = vi.fn()

      await sendSessionUserActions(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionActions, 'http://example.com', nop, nop, fetch)

      expect(fetch).toBeCalledWith(
        buildGravityTrackingApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS),
        {
          body: JSON.stringify(sessionActions),
          headers: {
            "Content-Type": "application/json",
            "Origin": "http://example.com"
          },
          method: "POST"
        }
      )
    })

    it('does not set the `Origin` header when no source is provided', async () => {
      const fetch = vi.fn()

      await sendSessionUserActions(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionActions, null, nop, nop, fetch)

      expect(fetch).toBeCalledWith(
        buildGravityTrackingApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS),
        {
          body: JSON.stringify(sessionActions),
          headers: {
            "Content-Type": "application/json"
          },
          method: "POST"
        }
      )
    })
  })
})
