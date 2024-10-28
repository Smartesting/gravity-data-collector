import HttpGravityClient from './HttpGravityClient'
import { GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { expect, Mock, vi } from 'vitest'
import { mockFetch } from '../test-utils/mocks'
import RecordingSettingsDispatcher from './RecordingSettingsDispatcher'
import { createDummy } from '../test-utils/dummyFactory'
import { config } from '../config'
import { uuid } from '../utils/uuid'
import { nop } from '../utils/nop'
import assert from 'assert'
import { SessionTraits, SessionUserAction } from '../types'
import { eventWithTime } from '@smartesting/rrweb-types'

const DEFAULT_OPTIONS = {
  requestInterval: 0,
  authKey: uuid(),
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
        const recordingSettingsDispatcher = new RecordingSettingsDispatcher(nop)
        const spyOnTerminate = vi.spyOn(recordingSettingsDispatcher, 'terminate')
        const gravityClient = new HttpGravityClient(
          DEFAULT_OPTIONS,
          recordingSettingsDispatcher,
          nop,
          mockFetch({
            status: statusCode,
            responseBody: () => ({
              error: `error with code=${statusCode}`,
            }),
          }),
        )
        recordingSettingsDispatcher.dispatch({
          sessionRecording: true,
          videoRecording: false,
        })
        await gravityClient.addSessionUserAction(createDummy())
        await gravityClient.flush()

        expect(spyOnTerminate).toHaveBeenCalled()
      })
    }
  })

  describe('collector api url', () => {
    it('is provided by fetched settings', async () => {
      const recordingSettingsDispatcher = new RecordingSettingsDispatcher(nop)
      const fetch: Mock<(input: string | URL | Request, init?: RequestInit) => Promise<Response>> = mockFetch()
      const gravityClient = new HttpGravityClient(DEFAULT_OPTIONS, recordingSettingsDispatcher, nop, fetch)

      await gravityClient.readSessionCollectionSettings()
      expect(fetch).toHaveBeenCalledOnce()
      assert.equal(
        fetch.mock.lastCall![0],
        `${DEFAULT_OPTIONS.gravityServerUrl}/api/tracking/${DEFAULT_OPTIONS.authKey}/settings`,
      )

      await gravityClient.handleSessionUserActions([createDummy<SessionUserAction>()])
      expect(fetch).toHaveBeenCalledTimes(2)
      assert.equal(
        fetch.mock.lastCall![0],
        `${DEFAULT_OPTIONS.gravityServerUrl}/api/tracking/${DEFAULT_OPTIONS.authKey}/publish`,
      )

      await gravityClient.handleVideoRecords('session_id', [createDummy<eventWithTime>()])
      expect(fetch).toHaveBeenCalledTimes(3)
      assert.equal(
        fetch.mock.lastCall![0],
        `${DEFAULT_OPTIONS.gravityServerUrl}/api/tracking/${DEFAULT_OPTIONS.authKey}/record/session_id`,
      )

      await gravityClient.handleSessionTraits('session_id', createDummy<SessionTraits>())
      expect(fetch).toHaveBeenCalledTimes(4)
      assert.equal(
        fetch.mock.lastCall![0],
        `${DEFAULT_OPTIONS.gravityServerUrl}/api/tracking/${DEFAULT_OPTIONS.authKey}/identify/session_id`,
      )

      recordingSettingsDispatcher.dispatch({
        sessionRecording: false,
        videoRecording: false,
        collectorApiUrl: 'https://test-collector-api.example.com',
      })

      await gravityClient.handleSessionUserActions([createDummy<SessionUserAction>()])
      expect(fetch).toHaveBeenCalledTimes(5)
      assert.equal(
        fetch.mock.lastCall![0],
        `https://test-collector-api.example.com/api/tracking/${DEFAULT_OPTIONS.authKey}/publish`,
      )

      await gravityClient.handleVideoRecords('session_id', [createDummy<eventWithTime>()])
      expect(fetch).toHaveBeenCalledTimes(6)
      assert.equal(
        fetch.mock.lastCall![0],
        `https://test-collector-api.example.com/api/tracking/${DEFAULT_OPTIONS.authKey}/record/session_id`,
      )

      await gravityClient.handleSessionTraits('session_id', createDummy<SessionTraits>())
      expect(fetch).toHaveBeenCalledTimes(7)
      assert.equal(
        fetch.mock.lastCall![0],
        `https://test-collector-api.example.com/api/tracking/${DEFAULT_OPTIONS.authKey}/identify/session_id`,
      )
    })
  })
})
