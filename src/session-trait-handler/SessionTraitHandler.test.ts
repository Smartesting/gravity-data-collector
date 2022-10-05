import { beforeEach, describe, expect, it, vi } from 'vitest'
import { debugSessionTraitHandler, defaultSessionTraitHandler, sendSessionTrait } from './SessionTraitHandler'
import { DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR, VALID_AUTH_KEY } from '../mocks/handlers'
import { buildGravityTrackingIdentifySessionApiUrl, GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'

describe('SessionTraitHandler', () => {
  describe('defaultUserActionSessionSender', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    const spySuccess = vi.fn()
    const spyError = vi.fn()

    it('sends session trait if valid auth key', async () => {
      await defaultSessionTraitHandler(
        VALID_AUTH_KEY,
        GRAVITY_SERVER_ADDRESS,
        '123-abd',
        null,
        spySuccess,
      )('connected', true)
      await waitFor(() => {
        expect(spySuccess).toHaveBeenCalledWith({ error: null })
      })
    })

    it('catches error if invalid auth key', async () => {
      await defaultSessionTraitHandler(
        'DUMMY_AUTH_KEY',
        GRAVITY_SERVER_ADDRESS,
        '123-abc',
        null,
        spySuccess,
        spyError,
      )('connected', true)
      await waitFor(() => {
        expect(spyError).toHaveBeenCalledWith('error 404, Not Found')
      })
    })

    it('catches any error', async () => {
      await defaultSessionTraitHandler(
        DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR,
        GRAVITY_SERVER_ADDRESS,
        '123-abc',
        null,
        spySuccess,
        spyError,
      )('connected', true)
      await waitFor(() => {
        expect(spyError).toHaveBeenCalledOnce()
        expect((spyError.mock.lastCall as any[])[0]).toMatch(/request to (.+?) failed, reason: Network Error/)
      })
    })
  })

  describe('debugSessionTraitHandler', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    const spyOutput = vi.fn()

    it('outputs session trait', () => {
      debugSessionTraitHandler(spyOutput)('connected', true)
      expect(spyOutput).toHaveBeenCalledTimes(2)
      expect(spyOutput).toHaveBeenLastCalledWith('identify session with connected = true')
    })
  })

  describe('sendSessionTrait', () => {
    it('sets the `Origin` header when a source is provided', async () => {
      const fetch = vi.fn()

      await sendSessionTrait(
        VALID_AUTH_KEY,
        GRAVITY_SERVER_ADDRESS,
        '123-abc',
        'connected',
        true,
        'http://example.com',
        nop,
        nop,
        fetch,
      )

      expect(fetch).toBeCalledWith(
        buildGravityTrackingIdentifySessionApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, '123-abc'),
        {
          body: JSON.stringify({ connected: true }),
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

      await sendSessionTrait(
        VALID_AUTH_KEY,
        GRAVITY_SERVER_ADDRESS,
        '123-abc',
        'connected',
        true,
        null,
        nop,
        nop,
        fetch,
      )

      expect(fetch).toBeCalledWith(
        buildGravityTrackingIdentifySessionApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, '123-abc'),
        {
          body: JSON.stringify({ connected: true }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )
    })
  })
})
