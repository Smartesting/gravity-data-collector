import { expect, it, vi } from 'vitest'
import { VALID_AUTH_KEY } from '../mocks/handlers'
import { buildGravityTrackingPublishApiUrl, GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import HttpGravityClient from './HttpGravityClient'
import { v4 as uuidv4 } from 'uuid'
import { SessionUserAction } from '../types'

describe('HttpGravityClient', () => {
  const action = { sessionId: uuidv4() }
  const sessionUserActions: SessionUserAction[] = [action as SessionUserAction, action as SessionUserAction]

  it('sets the `Origin` header when a source is provided', async () => {
    const fetch = mockFetch()

    const gravityClient = new HttpGravityClient(
      0,
      {
        authKey: VALID_AUTH_KEY,
        gravityServerUrl: GRAVITY_SERVER_ADDRESS,
        source: 'http://example.com',
      },
      fetch,
    )
    await gravityClient.handleSessionUserActions(sessionUserActions)

    expect(fetch).toBeCalledWith(buildGravityTrackingPublishApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS), {
      body: JSON.stringify(sessionUserActions),
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://example.com',
      },
      method: 'POST',
      redirect: 'follow',
    })
  })

  it('does not set the `Origin` header when no source is provided', async () => {
    const fetch = mockFetch()

    const gravityClient = new HttpGravityClient(
      0,
      {
        authKey: VALID_AUTH_KEY,
        gravityServerUrl: GRAVITY_SERVER_ADDRESS,
        source: null,
      },
      fetch,
    )
    await gravityClient.handleSessionUserActions(sessionUserActions)

    expect(fetch).toBeCalledWith(buildGravityTrackingPublishApiUrl(VALID_AUTH_KEY, GRAVITY_SERVER_ADDRESS), {
      body: JSON.stringify(sessionUserActions),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      redirect: 'follow',
    })
  })
})

function mockFetch() {
  return vi.fn().mockImplementation(() => ({
    json: async (): Promise<any> => await Promise.resolve({}),
  }))
}
