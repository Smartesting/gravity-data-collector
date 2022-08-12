import { rest } from 'msw'
import { buildGravityTrackingApiUrl, GRAVITY_SERVER_ADDRESS } from '../user-action/userActionSessionSender'

export const VALID_AUTH_KEY = 'VALID_AUTH_KEY'
export const DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR = 'DUMMY_AUTH_KEY_CAUSING_ERROR'

export const handlers = [
  rest.post(buildGravityTrackingApiUrl(':authKey', GRAVITY_SERVER_ADDRESS), async (req, res, ctx) => {
    const { authKey } = req.params
    if (authKey === DUMMY_AUTH_KEY_CAUSING_NETWORK_ERROR) {
      throw new Error('Network Error')
    }
    if (authKey !== VALID_AUTH_KEY) {
      return await res(ctx.status(404), ctx.json({}))
    }
    const payload = await req.json()
    if (!Array.isArray(payload)) return await res(ctx.status(422), ctx.json({}))

    return await res(ctx.status(200), ctx.json({ error: null }))
  }),
]
