import { GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'
import { expect, SpyInstance, vi } from 'vitest'
import { EventType, eventWithTime } from '@rrweb/types'
import RecordingSettingsDispatcher from './RecordingSettingsDispatcher'
import { createDummy } from '../test-utils/dummyFactory'
import { GravityClientOptions } from './AbstractGravityClient'
import {
  AddSessionUserActionsError,
  AddSessionUserActionsResponse,
  ReadSessionCollectionSettingsResponse,
  SessionUserAction,
} from '../types'
import { uuid } from '../utils/uuid'
import NopGravityClient from './NopGravityClient'

const DEFAULT_OPTIONS = {
  requestInterval: 0,
  authKey: uuid(),
  gravityServerUrl: GRAVITY_SERVER_ADDRESS,
  onError: vi.fn(),
  onPublish: vi.fn(),
  enableEventRecording: true,
  enableVideoRecording: true,
}

describe('AbstractGravityClient', () => {
  it('calls onPublish if it is defined', async () => {
    const onPublish = vi.fn()
    const gravityClient = new TestGravityClient({
      ...DEFAULT_OPTIONS,
      onPublish,
    })

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
      const gravityClient: TestGravityClient = new TestGravityClient(DEFAULT_OPTIONS)
      const spyHandleScreenRecords = vi.spyOn(gravityClient, 'handleScreenRecords')

      await gravityClient.addScreenRecord(sessionId, screenRecord)
      await gravityClient.flush()
      expect(spyHandleScreenRecords).not.toHaveBeenCalled()

      await gravityClient.addSessionUserAction(createDummy())
      await gravityClient.flush()
      expect(spyHandleScreenRecords).toHaveBeenCalled()
    })

    it('does not handle screen records when user actions are sent with error', async () => {
      const gravityClient = new (class extends TestGravityClient {
        async handleSessionUserActions(
          sessionUserActions: ReadonlyArray<SessionUserAction>,
        ): Promise<AddSessionUserActionsResponse> {
          return { error: AddSessionUserActionsError.invalidFormat }
        }
      })(DEFAULT_OPTIONS)

      const spyHandleScreenRecords = vi.spyOn(gravityClient, 'handleScreenRecords')

      await gravityClient.addSessionUserAction(createDummy())
      await gravityClient.addScreenRecord(sessionId, screenRecord)
      await gravityClient.flush()
      expect(spyHandleScreenRecords).not.toHaveBeenCalled()
    })
  })

  describe('handle session traits', () => {
    let gravityClient: TestGravityClient
    let handleSessionTraits: SpyInstance

    beforeEach(async () => {
      gravityClient = new TestGravityClient({
        ...DEFAULT_OPTIONS,
        requestInterval: 150,
      })
      handleSessionTraits = vi.spyOn(gravityClient, 'handleSessionTraits')
      await gravityClient.flush()
    })

    afterEach(() => {
      handleSessionTraits.mockRestore()
    })

    it('does not send traits when none have been collected', async () => {
      await gravityClient.identifySession('id', { age: 42 })
      await gravityClient.flush()
      expect(handleSessionTraits).not.to.toHaveBeenCalled()
    })

    describe('when at least one sessionUserAction has been collected', () => {
      beforeEach(async () => {
        await gravityClient.addSessionUserAction(createDummy())
        await gravityClient.flush()
      })

      it('sends all traits in a request', async () => {
        const spy = vi.spyOn(gravityClient, 'handleSessionTraits')
        const sessionId = '123'
        await gravityClient.identifySession(sessionId, {
          admin: true,
        })
        await gravityClient.identifySession(sessionId, {
          country: 'Zanzibar',
        })
        await gravityClient.flush()
        expect(spy).to.toHaveBeenCalledOnce()
        expect(spy).to.toHaveBeenCalledWith('123', {
          admin: true,
          country: 'Zanzibar',
        })
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
        expect(handleSessionTraits).to.toHaveBeenCalledOnce()
        expect(handleSessionTraits).to.toHaveBeenCalledWith(sessionId, {
          admin: true,
          country: 'Zanzibar',
        })
      })
    })
  })
})

class TestGravityClient extends NopGravityClient {
  constructor(
    options: GravityClientOptions,
    recordingSettingsDispatcher: RecordingSettingsDispatcher = new RecordingSettingsDispatcher(),
  ) {
    super(options, recordingSettingsDispatcher)
    recordingSettingsDispatcher.dispatch({
      enableEventRecording: true,
      enableVideoRecording: true,
      enableSnapshotRecording: true,
      enableVideoAnonymization: true,
      anonymizeSelectors: undefined,
      ignoreSelectors: undefined,
    })
  }

  async readSessionCollectionSettings(): Promise<ReadSessionCollectionSettingsResponse> {
    return {
      error: null,
      settings: null,
    }
  }
}
