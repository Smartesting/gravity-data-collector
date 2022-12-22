import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VALID_AUTH_KEY, VALID_SESSION_ID } from '../mocks/handlers'
import { nop } from '../utils/nop'
import { buildGravityTrackingIdentifySessionApiUrl, GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { debugSessionTraitSender, IdentifySessionError, sendSessionTraits } from './sessionTraitSender'

describe('sessionTraitSender', () => {
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
      const fetch = mockFetch()

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
      const fetch = mockFetch()

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

    describe('return a response typed IdentifySessionResponse', async () => {
      const onSuccess: () => void = vi.fn()
      const onError: (statusCode: number, error: IdentifySessionError) => void = vi.fn()

      beforeEach(() => {
        vi.clearAllMocks()
      })

      it('without error if succeeded', async () => {
        expect(
          await sendSessionTraits(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            VALID_SESSION_ID,
            { age: 23 },
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: null })
        expect(onSuccess).toHaveBeenCalled()
        expect(onError).not.toHaveBeenCalled()
      })

      it('with accessDenied error if sessionId is incorrect', async () => {
        expect(
          await sendSessionTraits(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            'notAccessibleSessionId',
            { age: 23 },
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: IdentifySessionError.accessDenied })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(403, IdentifySessionError.accessDenied)
      })

      it('with noCollection error if authKey does not match a known session collection', async () => {
        expect(
          await sendSessionTraits(
            'unknownAuthKey',
            GRAVITY_SERVER_ADDRESS,
            VALID_SESSION_ID,
            { age: 23 },
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: IdentifySessionError.collectionNotFound })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(404, IdentifySessionError.collectionNotFound)
      })

      it('with invalidField error if the trait value has invalid format', async () => {
        expect(
          await sendSessionTraits(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            VALID_SESSION_ID,
            { tooLong: 'a'.repeat(256) },
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: IdentifySessionError.invalidField })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(422, IdentifySessionError.invalidField)
      })

      it('with incorrectSource error if source is not allowed', async () => {
        expect(
          await sendSessionTraits(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            VALID_SESSION_ID,
            { age: 23 },
            'https://polop.com',
            onSuccess,
            onError,
          ),
        ).toEqual({ error: IdentifySessionError.incorrectSource })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(403, IdentifySessionError.incorrectSource)
      })
    })
  })
})

function mockFetch() {
  return vi.fn().mockImplementation(() => ({
    json: async (): Promise<any> => await Promise.resolve({}),
  }))
}
