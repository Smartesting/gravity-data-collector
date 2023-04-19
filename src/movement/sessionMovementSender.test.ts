import { v4 as uuidv4 } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SessionMovement } from '../types'
import { ANOTHER_VALID_AUTH_KEY, VALID_AUTH_KEY } from '../mocks/handlers'
import { nop } from '../utils/nop'
import { buildGravityTrackingPublishApiUrl, GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { AddMovementsError, debugMovements, sendMovements } from './sessionMovementSender'

describe('sessionUserActionSender', () => {
  const action = { sessionId: uuidv4() }
  const sessionMovements: SessionMovement[] = [action as SessionMovement, action as SessionMovement]

  describe('debugUserActionSessionSender', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.clearAllTimers()
      vi.restoreAllMocks()
    })
    const spyOutput = vi.fn()

    it('outputs session user actions immediately if no maxDelay', () => {
      debugMovements(0, spyOutput)(sessionMovements)
      expect(spyOutput).toHaveBeenCalledTimes(3)
    })

    it('outputs session user actions immediately if maxDelay', () => {
      debugMovements(5000, spyOutput)(sessionMovements)
      expect(spyOutput).toHaveBeenCalledTimes(0)
      vi.advanceTimersByTime(5000)
      expect(spyOutput).toHaveBeenCalledTimes(3)
    })
  })

  describe('sendSessionUserActions', () => {
    it('sets the `Origin` header when a source is provided', async () => {
      const fetch = mockFetch()

      await sendMovements(
        VALID_AUTH_KEY,
        GRAVITY_SERVER_ADDRESS,
        sessionMovements,
        'http://example.com',
        nop,
        nop,
        fetch,
      )

      expect(fetch).toBeCalledWith(buildGravityTrackingPublishApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS), {
        body: JSON.stringify(sessionMovements),
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://example.com',
        },
        method: 'POST',
      })
    })

    it('does not set the `Origin` header when no source is provided', async () => {
      const fetch = mockFetch()

      await sendMovements(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionMovements, null, nop, nop, fetch)

      expect(fetch).toBeCalledWith(buildGravityTrackingPublishApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS), {
        body: JSON.stringify(sessionMovements),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
    })

    describe('return a response typed AddSessionUserActionsResponse', async () => {
      const onSuccess: () => void = vi.fn()
      const onError: (statusCode: number, reason: AddMovementsError) => void = vi.fn()

      beforeEach(() => {
        vi.clearAllMocks()
      })

      it('without error if succeeded', async () => {
        expect(
          await sendMovements(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionMovements, null, onSuccess, onError),
        ).toEqual({ error: null })
        expect(onSuccess).toHaveBeenCalled()
        expect(onError).not.toHaveBeenCalled()
      })

      it('with noCollection error if authKey does not match a known session collection', async () => {
        expect(
          await sendMovements('unknownAuthKey', GRAVITY_SERVER_ADDRESS, sessionMovements, null, onSuccess, onError),
        ).toEqual({ error: AddMovementsError.collectionNotFound })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(404, AddMovementsError.collectionNotFound)
      })

      it('with incorrectSource error if source is not allowed', async () => {
        expect(
          await sendMovements(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            sessionMovements,
            'https://polop.com',
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddMovementsError.incorrectSource })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(403, AddMovementsError.incorrectSource)
      })

      it('with notUUID error if sessionId is not an UUID', async () => {
        expect(
          await sendMovements(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            [
              {
                ...sessionMovements[0],
                sessionId: 'not_an_uuid',
              },
            ],
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddMovementsError.notUUID })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(422, AddMovementsError.notUUID)
      })

      it('with conflict error if the same sessionId are sent to two different session collections', async () => {
        expect(await sendMovements(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionMovements)).toEqual({
          error: null,
        })

        expect(
          await sendMovements(
            ANOTHER_VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            sessionMovements,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddMovementsError.conflict })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(409, AddMovementsError.conflict)
      })

      it('2with conflict error if the same sessionId are sent to two different session collections', async () => {
        expect(await sendMovements(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionMovements)).toEqual({
          error: null,
        })

        expect(
          await sendMovements(
            ANOTHER_VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            sessionMovements,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddMovementsError.conflict })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(409, AddMovementsError.conflict)
      })

      it('3with conflict error if the same sessionId are sent to two different session collections', async () => {
        expect(await sendMovements(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionMovements)).toEqual({
          error: null,
        })

        expect(
          await sendMovements(
            ANOTHER_VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            sessionMovements,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddMovementsError.conflict })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(409, AddMovementsError.conflict)
      })
    })
  })
})

function mockFetch() {
  return vi.fn().mockImplementation(() => ({
    json: async (): Promise<any> => await Promise.resolve({}),
  }))
}
