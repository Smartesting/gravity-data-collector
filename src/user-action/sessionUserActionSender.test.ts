import { v4 as uuidv4 } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AddSessionUserActionsError,
  debugSessionUserActionSender,
  sendSessionUserActions,
} from './sessionUserActionSender'
import { SessionUserAction } from '../types'
import { ANOTHER_VALID_AUTH_KEY, VALID_AUTH_KEY } from '../mocks/handlers'
import { nop } from '../utils/nop'
import { buildGravityTrackingPublishApiUrl, GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'

describe('sessionUserActionSender', () => {
  const action = { sessionId: uuidv4() }
  const sessionActions: SessionUserAction[] = [action as SessionUserAction, action as SessionUserAction]

  describe('debugUserActionSessionSender', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.clearAllTimers()
      vi.restoreAllMocks()
    })
    const spyOutput = vi.fn()

    it('outputs session user actions immediately if no maxDelay', () => {
      debugSessionUserActionSender(0, spyOutput)(sessionActions)
      expect(spyOutput).toHaveBeenCalledTimes(3)
    })

    it('outputs session user actions immediately if maxDelay', () => {
      debugSessionUserActionSender(5000, spyOutput)(sessionActions)
      expect(spyOutput).toHaveBeenCalledTimes(0)
      vi.advanceTimersByTime(5000)
      expect(spyOutput).toHaveBeenCalledTimes(3)
    })
  })

  describe('sendSessionUserActions', () => {
    it('sets the `Origin` header when a source is provided', async () => {
      const fetch = mockFetch()

      await sendSessionUserActions(
        VALID_AUTH_KEY,
        GRAVITY_SERVER_ADDRESS,
        sessionActions,
        'http://example.com',
        nop,
        nop,
        fetch,
      )

      expect(fetch).toBeCalledWith(buildGravityTrackingPublishApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS), {
        body: JSON.stringify(sessionActions),
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://example.com',
        },
        method: 'POST',
      })
    })

    it('does not set the `Origin` header when no source is provided', async () => {
      const fetch = mockFetch()

      await sendSessionUserActions(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionActions, null, nop, nop, fetch)

      expect(fetch).toBeCalledWith(buildGravityTrackingPublishApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS), {
        body: JSON.stringify(sessionActions),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
    })

    describe('return a response typed AddSessionUserActionsResponse', async () => {
      const onSuccess: () => void = vi.fn()
      const onError: (statusCode: number, reason: AddSessionUserActionsError) => void = vi.fn()

      beforeEach(() => {
        vi.clearAllMocks()
      })

      it('without error if succeeded', async () => {
        expect(
          await sendSessionUserActions(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            sessionActions,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: null })
        expect(onSuccess).toHaveBeenCalled()
        expect(onError).not.toHaveBeenCalled()
      })

      it('with noCollection error if authKey does not match a known session collection', async () => {
        expect(
          await sendSessionUserActions(
            'unknownAuthKey',
            GRAVITY_SERVER_ADDRESS,
            sessionActions,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddSessionUserActionsError.collectionNotFound })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(404, AddSessionUserActionsError.collectionNotFound)
      })

      it('with incorrectSource error if source is not allowed', async () => {
        expect(
          await sendSessionUserActions(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            sessionActions,
            'https://polop.com',
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddSessionUserActionsError.incorrectSource })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(403, AddSessionUserActionsError.incorrectSource)
      })

      it('with notUUID error if sessionId is not an UUID', async () => {
        expect(
          await sendSessionUserActions(
            VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            [
              {
                ...sessionActions[0],
                sessionId: 'not_an_uuid',
              },
            ],
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddSessionUserActionsError.notUUID })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(422, AddSessionUserActionsError.notUUID)
      })

      it('with conflict error if the same sessionId are sent to two different session collections', async () => {
        expect(await sendSessionUserActions(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionActions)).toEqual({
          error: null,
        })

        expect(
          await sendSessionUserActions(
            ANOTHER_VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            sessionActions,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddSessionUserActionsError.conflict })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(409, AddSessionUserActionsError.conflict)
      })

      it('2with conflict error if the same sessionId are sent to two different session collections', async () => {
        expect(await sendSessionUserActions(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionActions)).toEqual({
          error: null,
        })

        expect(
          await sendSessionUserActions(
            ANOTHER_VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            sessionActions,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddSessionUserActionsError.conflict })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(409, AddSessionUserActionsError.conflict)
      })

      it('3with conflict error if the same sessionId are sent to two different session collections', async () => {
        expect(await sendSessionUserActions(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS, sessionActions)).toEqual({
          error: null,
        })

        expect(
          await sendSessionUserActions(
            ANOTHER_VALID_AUTH_KEY,
            GRAVITY_SERVER_ADDRESS,
            sessionActions,
            null,
            onSuccess,
            onError,
          ),
        ).toEqual({ error: AddSessionUserActionsError.conflict })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(409, AddSessionUserActionsError.conflict)
      })
    })
  })
})

function mockFetch() {
  return vi.fn().mockImplementation(() => ({
    json: async (): Promise<any> => await Promise.resolve({}),
  }))
}
