import HttpGravityClient from './HttpGravityClient'
import { VALID_AUTH_KEY } from '../mocks/handlers'
import { GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { expect, vi } from 'vitest'
import { SessionUserAction } from '../types'
import { mockFetch } from '../test-utils/mocks'

describe('HttpGravityClient', () => {
  it('calls onPublish if it is defined', async () => {
    const onPublish = vi.fn()
    const gravityClient = new HttpGravityClient(
      0,
      {
        authKey: VALID_AUTH_KEY,
        gravityServerUrl: GRAVITY_SERVER_ADDRESS,
        onPublish,
      },
      mockFetch(),
    )
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    await gravityClient.addSessionUserAction({ sessionId: 'whatever' } as SessionUserAction)
    await gravityClient.flush()
    expect(onPublish).toHaveBeenCalledTimes(1)
  })

  describe('handle session traits', () => {
    it('sends all traits in a request', async () => {
      const mockedFetch = mockFetch()
      const gravityClient = new HttpGravityClient(
        150,
        {
          authKey: VALID_AUTH_KEY,
          gravityServerUrl: GRAVITY_SERVER_ADDRESS,
          onPublish: vi.fn(),
        },
        mockedFetch,
      )
      const sessionId = '123'
      await gravityClient.identifySession(sessionId, {
        admin: true,
      })
      await gravityClient.identifySession(sessionId, {
        country: 'Zanzibar',
      })
      await gravityClient.flush()
      expect(mockedFetch).to.toHaveBeenCalledTimes(1)
      expect(mockedFetch).to.toHaveBeenCalledWith(
        `${GRAVITY_SERVER_ADDRESS}/api/tracking/${VALID_AUTH_KEY}/identify/${sessionId}`,
        {
          method: 'POST',
          body: JSON.stringify({ admin: true, country: 'Zanzibar' }),
          headers: {
            'Content-Type': 'application/json',
          },
          redirect: 'follow',
        },
      )
    })

    // it should never happen
    it('only sends traits from the first session', async () => {
      const mockedFetch = mockFetch()
      const gravityClient = new HttpGravityClient(
        150,
        {
          authKey: VALID_AUTH_KEY,
          gravityServerUrl: GRAVITY_SERVER_ADDRESS,
          onPublish: vi.fn(),
        },
        mockedFetch,
      )
      const sessionId = '123'
      await gravityClient.identifySession(sessionId, {
        admin: true,
      })
      await gravityClient.identifySession('789', {
        tree: 'spruce',
      })
      await gravityClient.identifySession(sessionId, {
        country: 'Zanzibar',
      })
      await gravityClient.flush()
      expect(mockedFetch).to.toHaveBeenCalledTimes(1)
      expect(mockedFetch).to.toHaveBeenCalledWith(
        `${GRAVITY_SERVER_ADDRESS}/api/tracking/${VALID_AUTH_KEY}/identify/${sessionId}`,
        {
          method: 'POST',
          body: JSON.stringify({ admin: true, country: 'Zanzibar' }),
          headers: {
            'Content-Type': 'application/json',
          },
          redirect: 'follow',
        },
      )
    })

    it('does not send traits when none have been collected', async () => {
      const mockedFetch = mockFetch()
      const gravityClient = new HttpGravityClient(
        150,
        {
          authKey: VALID_AUTH_KEY,
          gravityServerUrl: GRAVITY_SERVER_ADDRESS,
          onPublish: vi.fn(),
        },
        mockedFetch,
      )
      await gravityClient.flush()
      expect(mockedFetch).not.to.toHaveBeenCalled()
    })
  })
})
