import HttpGravityClient from './HttpGravityClient'
import { GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { expect, vi } from 'vitest'
import { SessionUserAction } from '../types'
import { mockFetch } from '../test-utils/mocks'
import { v4 as uuidv4 } from 'uuid'
import { EventType, eventWithTime } from '@rrweb/types'
import { RecordingSettingsDispatcher } from './RecordingSettingsDispatcher'
import { createDummy } from '../test-utils/dummyFactory'

const DEFAULT_OPTIONS = {
  requestInterval: 0,
  authKey: uuidv4(),
  gravityServerUrl: GRAVITY_SERVER_ADDRESS,
  onError: vi.fn(),
  onPublish: vi.fn(),
  enableEventRecording: true,
  enableVideoRecording: true,
}

describe('HttpGravityClient', () => {
  it('does not call onError when receiving 200', async () => {
    const onError = vi.fn()
    const recordingSettingsDispatcher = new RecordingSettingsDispatcher()
    const gravityClient = new HttpGravityClient(
      {
        ...DEFAULT_OPTIONS,
        onError,
      },
      recordingSettingsDispatcher,
      mockFetch(),
    )
    recordingSettingsDispatcher.dispatch({ enableEventRecording: true, enableVideoRecording: false })

    await gravityClient.addSessionUserAction(createDummy<SessionUserAction>({ sessionId: 'whatever' }))
    await gravityClient.flush()
    expect(onError).not.toHaveBeenCalled()
  })

  it('calls onError when receiving other than 200', async () => {
    const onError = vi.fn()
    const recordingSettingsDispatcher = new RecordingSettingsDispatcher()
    const gravityClient = new HttpGravityClient(
      { ...DEFAULT_OPTIONS, onError },
      recordingSettingsDispatcher,
      mockFetch({
        status: 401,
        responseBody: { error: 'access_denied' },
      }),
    )
    recordingSettingsDispatcher.dispatch({ enableEventRecording: true, enableVideoRecording: false })

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    await gravityClient.addSessionUserAction({ sessionId: 'whatever' } as SessionUserAction)
    await gravityClient.flush()
    expect(onError).toHaveBeenCalledWith(401, 'access_denied')
  })

  it('calls onPublish if it is defined', async () => {
    const onPublish = vi.fn()
    const recordingSettingsDispatcher = new RecordingSettingsDispatcher()
    const gravityClient = new HttpGravityClient(
      { ...DEFAULT_OPTIONS, onPublish },
      recordingSettingsDispatcher,
      mockFetch(),
    )
    recordingSettingsDispatcher.dispatch({ enableEventRecording: true, enableVideoRecording: false })

    await gravityClient.addSessionUserAction(createDummy<SessionUserAction>({ sessionId: 'whatever' }))
    await gravityClient.flush()
    expect(onPublish).toHaveBeenCalledTimes(1)
  })

  // this prevents screen records from being sent when the session has not yet been created on the Gravity side
  describe('send screen records after user actions', () => {
    const sessionId = 'whatever'
    const screenRecord: eventWithTime = {
      timestamp: 42,
      data: {
        href: '',
        width: 42,
        height: 42,
      },
      type: EventType.Meta,
    }

    it('does not handle screen records until user actions are sent', async () => {
      const recordingSettingsDispatcher = new RecordingSettingsDispatcher()
      const gravityClient = new HttpGravityClient(
        DEFAULT_OPTIONS,
        recordingSettingsDispatcher,
        mockFetch({ responseBody: { error: null } }),
      )
      recordingSettingsDispatcher.dispatch({ enableEventRecording: true, enableVideoRecording: true })
      const spyHandleScreenRecords = vi.spyOn(gravityClient, 'handleScreenRecords')

      await gravityClient.addScreenRecord(sessionId, screenRecord)
      await gravityClient.flush()
      expect(spyHandleScreenRecords).not.toHaveBeenCalled()

      await gravityClient.addSessionUserAction(createDummy<SessionUserAction>({ sessionId }))
      await gravityClient.flush()
      expect(spyHandleScreenRecords).toHaveBeenCalled()
    })

    it('does not handle screen records when user actions are sent with error', async () => {
      const recordingSettingsDispatcher = new RecordingSettingsDispatcher()
      const gravityClient = new HttpGravityClient(
        DEFAULT_OPTIONS,
        recordingSettingsDispatcher,
        mockFetch({ responseBody: { error: 'aïe aïe aïe' } }),
      )
      recordingSettingsDispatcher.dispatch({ enableEventRecording: true, enableVideoRecording: false })
      const spyHandleScreenRecords = vi.spyOn(gravityClient, 'handleScreenRecords')

      await gravityClient.addSessionUserAction(createDummy<SessionUserAction>({ sessionId }))
      await gravityClient.addScreenRecord(sessionId, screenRecord)
      await gravityClient.flush()
      expect(spyHandleScreenRecords).not.toHaveBeenCalled()
    })
  })

  describe('handle session traits', () => {
    it('sends all traits in a request', async () => {
      const authKey = uuidv4()
      const mockedFetch = mockFetch()
      const recordingSettingsDispatcher = new RecordingSettingsDispatcher()
      const gravityClient = new HttpGravityClient(
        { ...DEFAULT_OPTIONS, requestInterval: 150, authKey },
        recordingSettingsDispatcher,
        mockedFetch,
      )
      recordingSettingsDispatcher.dispatch({ enableEventRecording: true, enableVideoRecording: false })

      const sessionId = '123'
      await gravityClient.identifySession(sessionId, {
        admin: true,
      })
      await gravityClient.identifySession(sessionId, {
        country: 'Zanzibar',
      })
      await gravityClient.flush()
      expect(mockedFetch).to.toHaveBeenCalledOnce()
      expect(mockedFetch).to.toHaveBeenCalledWith(
        `${GRAVITY_SERVER_ADDRESS}/api/tracking/${authKey}/identify/${sessionId}`,
        {
          method: 'POST',
          body: JSON.stringify({
            admin: true,
            country: 'Zanzibar',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          redirect: 'follow',
        },
      )
    })

    // it should never happen
    it('only sends traits from the first session', async () => {
      const authKey = uuidv4()
      const mockedFetch = mockFetch()
      const recordingSettingsDispatcher = new RecordingSettingsDispatcher()
      const gravityClient = new HttpGravityClient(
        { ...DEFAULT_OPTIONS, requestInterval: 150, authKey },
        recordingSettingsDispatcher,
        mockedFetch,
      )
      recordingSettingsDispatcher.dispatch({ enableEventRecording: true, enableVideoRecording: false })

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
      expect(mockedFetch).to.toHaveBeenCalledOnce()
      expect(mockedFetch).to.toHaveBeenCalledWith(
        `${GRAVITY_SERVER_ADDRESS}/api/tracking/${authKey}/identify/${sessionId}`,
        {
          method: 'POST',
          body: JSON.stringify({
            admin: true,
            country: 'Zanzibar',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          redirect: 'follow',
        },
      )
    })

    it('does not send traits when none have been collected', async () => {
      const mockedFetch = mockFetch()
      const recordingSettingsDispatcher = new RecordingSettingsDispatcher()
      const gravityClient = new HttpGravityClient(
        { ...DEFAULT_OPTIONS, requestInterval: 150 },
        recordingSettingsDispatcher,
        mockedFetch,
      )
      recordingSettingsDispatcher.dispatch({ enableEventRecording: true, enableVideoRecording: false })
      await gravityClient.flush()
      expect(mockedFetch).not.to.toHaveBeenCalled()
    })
  })
})
