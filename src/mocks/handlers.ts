import { rest } from 'msw'
import {
  buildGravityTrackingIdentifySessionApiUrl,
  buildGravityTrackingPublishApiUrl,
  GRAVITY_SERVER_ADDRESS,
} from '../gravityEndPoints'
import { v4 as uuidv4 } from 'uuid'
import { IdentifySessionError } from '../session-trait/sessionTraitSender'

export const VALID_AUTH_KEY = 'VALID_AUTH_KEY'
export const VALID_SESSION_ID = uuidv4()
export const VALID_SOURCE = 'https://my-domain.com'
export const DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR = 'DUMMY_AUTH_KEY_CAUSING_ERROR'

export const handlers = [
  rest.post(buildGravityTrackingPublishApiUrl(':authKey', GRAVITY_SERVER_ADDRESS), async (req, res, ctx) => {
    const { authKey } = req.params
    if (authKey === DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR) throw new Error('Network Error')
    if (authKey !== VALID_AUTH_KEY) return await res(ctx.status(403), ctx.json({}))
    const payload = await req.json()
    if (!Array.isArray(payload)) return await res(ctx.status(422), ctx.json({}))
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
      if (authKey !== VALID_AUTH_KEY) {
        return await res(ctx.status(404), ctx.json({ error: IdentifySessionError.noCollection }))
      }
      const payload = await req.json()
      for (const value of Object.values(payload)) {
        const type = typeof value
        if (!['string', 'boolean', 'number'].includes(type)) {
          return await res(ctx.status(422), ctx.json({ error: IdentifySessionError.invalidField }))
        }
        if (type === 'string' && (value as string).length > 255) {
          return await res(ctx.status(422), ctx.json({ error: IdentifySessionError.invalidField }))
        }
      }
      return await res(ctx.status(200), ctx.json({ error: null }))
    },
  ),
]

function getHostname(source: string) {
  try {
    return new URL(source).hostname
  } catch (_) {}
}
