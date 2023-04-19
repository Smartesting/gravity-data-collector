import { rest } from 'msw'
import {
  buildGravityTrackingIdentifySessionApiUrl,
  buildGravityTrackingPublishApiUrl,
  GRAVITY_SERVER_ADDRESS,
} from '../gravityEndPoints'
import { v4 as uuidv4 } from 'uuid'
import { isUUID } from '../test-utils/isUUID'
import { AddMovementsError } from '../movement/sessionMovementSender'
import { IdentifySessionError } from '../session-trait/sessionTraitSender'
import { getHostname } from '../test-utils/getHostname'
import { checkSessionTraitValue } from '../session-trait/checkSessionTraitValue'

export const VALID_AUTH_KEY = uuidv4()
export const ANOTHER_VALID_AUTH_KEY = uuidv4()
export const VALID_SESSION_ID = uuidv4()
export const VALID_SOURCE = 'https://my-domain.com'
export const DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR = 'DUMMY_AUTH_KEY_CAUSING_ERROR'

export const AUTH_KEY_BY_SESSION_ID: Map<string, string> = new Map<string, string>()

export const handlers = [
  rest.post(buildGravityTrackingPublishApiUrl(':authKey', GRAVITY_SERVER_ADDRESS), async (req, res, ctx) => {
    const { authKey } = req.params
    if (authKey === DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR) throw new Error('Network Error')
    if (authKey !== VALID_AUTH_KEY && authKey !== ANOTHER_VALID_AUTH_KEY) {
      return await res(ctx.status(404), ctx.json({ error: AddMovementsError.collectionNotFound }))
    }

    const origin = req.headers.get('Origin')
    if (origin !== null && getHostname(origin) !== VALID_SOURCE) {
      return await res(ctx.status(403), ctx.json({ error: AddMovementsError.incorrectSource }))
    }

    const payload = await req.json()
    if (!Array.isArray(payload)) {
      return await res(ctx.status(422), ctx.json({ error: AddMovementsError.invalidFormat }))
    }
    for (const action of payload) {
      if (!isUUID(action.sessionId)) {
        return await res(ctx.status(422), ctx.json({ error: AddMovementsError.notUUID }))
      }
      const associatedAuthKey = AUTH_KEY_BY_SESSION_ID.get(action.sessionId)
      if (associatedAuthKey !== undefined && associatedAuthKey !== authKey) {
        return await res(ctx.status(409), ctx.json({ error: AddMovementsError.conflict }))
      }
      AUTH_KEY_BY_SESSION_ID.set(action.sessionId, authKey)
    }
    return await res(ctx.status(200), ctx.json({ error: null }))
  }),

  rest.post(
    buildGravityTrackingIdentifySessionApiUrl(':authKey', GRAVITY_SERVER_ADDRESS, ':sessionId'),
    async (req, res, ctx) => {
      const { authKey, sessionId } = req.params
      if (authKey === DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR) throw new Error('Network Error')
      if (sessionId !== VALID_SESSION_ID) {
        return await res(ctx.status(403), ctx.json({ error: IdentifySessionError.accessDenied }))
      }
      const origin = req.headers.get('Origin')
      if (origin !== null && getHostname(origin) !== VALID_SOURCE) {
        return await res(ctx.status(403), ctx.json({ error: IdentifySessionError.incorrectSource }))
      }
      if (authKey !== VALID_AUTH_KEY && authKey !== ANOTHER_VALID_AUTH_KEY) {
        return await res(ctx.status(404), ctx.json({ error: IdentifySessionError.collectionNotFound }))
      }
      const payload = await req.json()
      for (const value of Object.values(payload)) {
        if (!checkSessionTraitValue(value)) {
          return await res(ctx.status(422), ctx.json({ error: IdentifySessionError.invalidField }))
        }
      }
      return await res(ctx.status(200), ctx.json({ error: null }))
    },
  ),
]
