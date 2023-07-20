import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VALID_AUTH_KEY, VALID_SESSION_ID } from '../mocks/handlers'
import { nop } from '../utils/nop'
import { buildGravityTrackingMonitorSessionApiUrl, GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { AddWebVitalError, debugWebVitalSender, sendWebVital } from './webVitalSender'
import { Metric } from 'web-vitals'

describe('webVitalSender', () => {
  const metric: Metric = {
    name: 'LCP',
    value: 50,
    rating: 'good',
    delta: 50,
    entries: [],
    id: 'v3-1689682976807-3720147479835',
    navigationType: 'navigate',
  }

  describe('debugWebVitalSender', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.clearAllTimers()
      vi.restoreAllMocks()
    })
    const spyOutput = vi.fn()

    it('outputs web vitals immediately if no maxDelay', () => {
      debugWebVitalSender(0, spyOutput)('123-abd', metric)
      expect(spyOutput).toHaveBeenCalled()
    })

    it('outputs web vitals immediately if maxDelay', () => {
      debugWebVitalSender(5000, spyOutput)('123-abd', metric)
      expect(spyOutput).toHaveBeenCalledTimes(0)
      vi.advanceTimersByTime(5000)
      expect(spyOutput).toHaveBeenCalled()
    })
  })

  describe('sendWebVital', () => {
    it('sets the `Origin` header when a source is provided', async () => {
      const fetch = mockFetch()

      await sendWebVital(
        VALID_AUTH_KEY,
        GRAVITY_SERVER_ADDRESS,
        '123-abc',
        metric,
        'http://example.com',
        nop,
        nop,
        fetch,
      )

      expect(fetch).toBeCalledWith(
        buildGravityTrackingMonitorSessionApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, '123-abc'),
        {
          body: JSON.stringify(metric),
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

      await sendWebVital(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, '123-abc', metric, null, nop, nop, fetch)

      expect(fetch).toBeCalledWith(
        buildGravityTrackingMonitorSessionApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, '123-abc'),
        {
          body: JSON.stringify(metric),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )
    })

    describe('return a response typed AddWebVitalResponse', async () => {
      const onSuccess: (metric: Metric) => void = vi.fn()
      const onError: (statusCode: number, error: AddWebVitalError) => void = vi.fn()

      beforeEach(() => {
        vi.clearAllMocks()
      })

      it('without error if succeeded', async () => {
        expect(
          await sendWebVital(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            VALID_SESSION_ID,
            metric,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({
          metric,
          error: null,
        })
        expect(onSuccess).toHaveBeenCalledWith(metric)
        expect(onError).not.toHaveBeenCalled()
      })

      it('with accessDenied error if sessionId is incorrect', async () => {
        expect(
          await sendWebVital(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            'notAccessibleSessionId',
            metric,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddWebVitalError.accessDenied })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(403, AddWebVitalError.accessDenied)
      })

      it('with noCollection error if authKey does not match a known session collection', async () => {
        expect(
          await sendWebVital(
            'unknownAuthKey',
            GRAVITY_SERVER_ADDRESS,
            VALID_SESSION_ID,
            metric,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddWebVitalError.collectionNotFound })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(404, AddWebVitalError.collectionNotFound)
      })

      it('with incorrectSource error if source is not allowed', async () => {
        expect(
          await sendWebVital(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            VALID_SESSION_ID,
            metric,
            'https://polop.com',
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddWebVitalError.incorrectSource })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(403, AddWebVitalError.incorrectSource)
      })
    })
  })
})

function mockFetch() {
  return vi.fn().mockImplementation(() => ({
    json: async (): Promise<any> => ({}),
  }))
}
