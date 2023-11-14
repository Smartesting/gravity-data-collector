import HttpGravityClient from './HttpGravityClient'
import { GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { expect, Mock, vi } from 'vitest'
import { mockFetch } from '../test-utils/mocks'
import { v4 as uuidv4 } from 'uuid'
import { EventType, eventWithTime } from '@rrweb/types'
import { RecordingSettingsDispatcher } from './RecordingSettingsDispatcher'
import { createDummy } from '../test-utils/dummyFactory'
import { config } from '../config'
import { IGravityClient } from './IGravityClient'

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
  describe('handles recording termination when received some error codes', () => {
    for (const statusCode of config.ERRORS_TERMINATE_TRACKING) {
      it(`received statusCode=${statusCode}`, async () => {
        const recordingSettingsDispatcher = new RecordingSettingsDispatcher()
        const spyOnTerminate = vi.spyOn(recordingSettingsDispatcher, 'terminate')
        const gravityClient = new HttpGravityClient(
          DEFAULT_OPTIONS,
          recordingSettingsDispatcher,
          mockFetch({
            status: statusCode,
            responseBody: { error: `error with code=${statusCode}` },
          }),
        )
        recordingSettingsDispatcher.dispatch({ enableEventRecording: true, enableVideoRecording: false })
        await gravityClient.addSessionUserAction(createDummy())
        await gravityClient.flush()

        expect(spyOnTerminate).toHaveBeenCalled()
      })
    }
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

    await gravityClient.addSessionUserAction(createDummy())
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

      await gravityClient.addSessionUserAction(createDummy())
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

      await gravityClient.addSessionUserAction(createDummy())
      await gravityClient.addScreenRecord(sessionId, screenRecord)
      await gravityClient.flush()
      expect(spyHandleScreenRecords).not.toHaveBeenCalled()
    })
  })

  describe('handle session traits', () => {
    const authKey = uuidv4()
    let mockedFetch: Mock
    let gravityClient: IGravityClient

    beforeEach(async () => {
      mockedFetch = mockFetch({ responseBody: { error: null } })
      const recordingSettingsDispatcher = new RecordingSettingsDispatcher()
      gravityClient = new HttpGravityClient(
        { ...DEFAULT_OPTIONS, requestInterval: 150, authKey },
        recordingSettingsDispatcher,
        mockedFetch,
      )
      recordingSettingsDispatcher.dispatch({ enableEventRecording: true, enableVideoRecording: false })
      await gravityClient.flush()
    })

    afterEach(() => {
      mockedFetch.mockRestore()
    })

    it('does not send traits when none have been collected', async () => {
      await gravityClient.identifySession('id', { age: 42 })
      await gravityClient.flush()
      expect(mockedFetch).not.to.toHaveBeenCalled()
    })

    describe('when at least one sessionUserAction has been collected', () => {
      beforeEach(async () => {
        await gravityClient.addSessionUserAction(createDummy())
        await gravityClient.flush()
        expect(mockedFetch).to.toHaveBeenCalledOnce()
        mockedFetch.mockClear()
      })

      it('sends all traits in a request', async () => {
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
    })
  })
})
