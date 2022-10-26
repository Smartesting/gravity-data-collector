import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR, VALID_AUTH_KEY } from '../mocks/handlers'
import { waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'
import { buildGravityTrackingIdentifySessionApiUrl, GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { debugSessionTraitSender, defaultSessionTraitSender, sendSessionTraits } from './sessionTraitSender'

describe('sessionTraitSender', () => {
  describe('defaultSessionTraitSender', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    const spySuccess = vi.fn()
    const spyError = vi.fn()

    it('sends session traits if valid auth key', async () => {
      await defaultSessionTraitSender(
        VALID_AUTH_KEY,
        GRAVITY_SERVER_ADDRESS,
        spySuccess,
      )('123-abd', { connected: true })
      await waitFor(() => {
        expect(spySuccess).toHaveBeenCalledWith({ error: null })
      })
    })

    it('catches error if invalid auth key', async () => {
      await defaultSessionTraitSender(
        'DUMMY_AUTH_KEY',
        GRAVITY_SERVER_ADDRESS,
        spySuccess,
        spyError,
      )('123-abd', { connected: true })
      await waitFor(() => {
        expect(spyError).toHaveBeenCalledWith(403)
      })
    })

    it('catches any error', async () => {
      await defaultSessionTraitSender(
        DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR,
        GRAVITY_SERVER_ADDRESS,
        spySuccess,
        spyError,
      )('123-abd', { connected: true })
      await waitFor(() => {
        expect(spyError).toHaveBeenCalledOnce()
        expect((spyError.mock.lastCall as any[])[0]).toMatch(/request to (.+?) failed, reason: Network Error/)
      })
    })
  })

  describe('debugSessionTraitSender', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.clearAllTimers()
      vi.restoreAllMocks()
    })
    const spyOutput = vi.fn()

    it('outputs session traits immediately if no maxDelay', () => {
      debugSessionTraitSender(0, spyOutput)('123-abd', { connected: true })
      expect(spyOutput).toHaveBeenCalled()
    })

    it('outputs session traits immediately if maxDelay', () => {
      debugSessionTraitSender(5000, spyOutput)('123-abd', { connected: true })
      expect(spyOutput).toHaveBeenCalledTimes(0)
      vi.advanceTimersByTime(5000)
      expect(spyOutput).toHaveBeenCalled()
    })
  })

  describe('sendSessionTraits', () => {
    it('sets the `Origin` header when a source is provided', async () => {
      const fetch = vi.fn()

      await sendSessionTraits(
        VALID_AUTH_KEY,
        GRAVITY_SERVER_ADDRESS,
        '123-abc',
        { connected: true },
        'http://example.com',
        nop,
        nop,
        fetch,
      )

      expect(fetch).toBeCalledWith(
        buildGravityTrackingIdentifySessionApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, '123-abc'),
        {
          body: '{"connected":true}',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'http://example.com',
          },
          method: 'POST',
        },
      )
    })

    it('does not set the `Origin` header when no source is provided', async () => {
      const fetch = vi.fn()

      await sendSessionTraits(
        VALID_AUTH_KEY,
        GRAVITY_SERVER_ADDRESS,
        '123-abc',
        { connected: true },
        null,
        nop,
        nop,
        fetch,
      )

      expect(fetch).toBeCalledWith(
        buildGravityTrackingIdentifySessionApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, '123-abc'),
        {
          body: '{"connected":true}',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )
    })
  })
})
