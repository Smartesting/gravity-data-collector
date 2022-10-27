import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { server } from './mocks/server'
import { AUTH_KEY_BY_SESSION_ID } from './mocks/handlers'

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
)
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

beforeEach(() => {
  AUTH_KEY_BY_SESSION_ID.clear()
})
