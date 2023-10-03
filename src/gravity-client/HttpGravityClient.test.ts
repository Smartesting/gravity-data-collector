import HttpGravityClient from './HttpGravityClient'
import { VALID_AUTH_KEY } from '../mocks/handlers'
import { GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { expect, vi } from 'vitest'
import { SessionUserAction } from '../types'

describe('HttpGravityClient', () => {
  it.skip('calls onPublish if it is defined', async () => {
    const onPublish = vi.fn()
    const gravityClient = new HttpGravityClient(
      0,
      {
        authKey: VALID_AUTH_KEY,
        gravityServerUrl: GRAVITY_SERVER_ADDRESS,
        onPublish,
      },
    )
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    await gravityClient.addSessionUserAction({ sessionId: 'whatever' } as SessionUserAction)
    await gravityClient.flush()
    expect(onPublish).toHaveBeenCalledTimes(1)
  })
})
