import { rest } from 'msw'
import { buildGravityTrackingApiUrl } from '../event/handler/configuration'

export const VALID_AUTH_KEY = 'VALID_AUTH_KEY'

export const handlers = [

  rest.post(buildGravityTrackingApiUrl(':authKey'), async (req, res, ctx) => {
    const { authKey } = req.params
    if (authKey !== VALID_AUTH_KEY) return await res(ctx.status(404), ctx.json({}))
    const payload = await req.json()
    if (!Array.isArray(payload)) return await res(ctx.status(422), ctx.json({}))

    return await res(
      ctx.status(200),
      ctx.json({ error: null }),
    )
  }),
]
