import HttpGravityClient from './HttpGravityClient'
import { GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { expect, vi } from 'vitest'
import { mockFetch } from '../test-utils/mocks'
import RecordingSettingsDispatcher from './RecordingSettingsDispatcher'
import { createDummy } from '../test-utils/dummyFactory'
import { config } from '../config'
import { uuid } from '../utils/uuid'

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
        recordingSettingsDispatcher.dispatch({
          enableEventRecording: true,
          enableVideoRecording: false,
          enableSnapshotRecording: false,
          enableVideoAnonymization: true,
          anonymizeSelectors: undefined,
          ignoreSelectors: undefined,
        })
        await gravityClient.addSessionUserAction(createDummy())
        await gravityClient.flush()

        expect(spyOnTerminate).toHaveBeenCalled()
      })
    }
  })
})
