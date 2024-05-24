import { describe, expect, it, SpyInstance, vi } from 'vitest'
import * as snapshotContainer from './snapshotContainer'
import SnapshotRecorderHandler from './SnapshotRecorderHandler'
import { CollectorOptions, CookieStrategy } from '../types'
import CookieTimeoutHandler from '../timeout-handler/CookieTimeoutHandler'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import NopGravityClient from '../gravity-client/NopGravityClient'
import * as createSnapshot from './createSnapshot'

describe('SnapshotRecorderHandler', () => {
  let spiedCreateSnapshotMethod: SpyInstance

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(snapshotContainer, 'installSnapshotContainer').mockReturnValue(global.window.document)
    spiedCreateSnapshotMethod = vi.spyOn(createSnapshot, 'createSnapshot').mockImplementation(() => null)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('sets snapshot inline options to true when "inlineResources" collector option is set to true', () => {
    const snapshotRecorderHandler = createSnapshotRecorderHandler({ inlineResources: true })
    snapshotRecorderHandler.initializeRecording()
    snapshotRecorderHandler.buildAndSendSnapshot()
    vi.advanceTimersByTime(200)
    expect(spiedCreateSnapshotMethod).toBeCalled()
    expect(spiedCreateSnapshotMethod.mock.lastCall![2]).toBeDefined()
    expect(spiedCreateSnapshotMethod.mock.lastCall![2]).toHaveProperty('inlineStylesheet', true)
    expect(spiedCreateSnapshotMethod.mock.lastCall![2]).toHaveProperty('inlineImages', true)
  })

  it('sets snapshot inline options to false when "inlineResources" collector option is set to false', () => {
    const snapshotRecorderHandler = createSnapshotRecorderHandler({ inlineResources: false })
    snapshotRecorderHandler.initializeRecording()
    snapshotRecorderHandler.buildAndSendSnapshot()
    vi.advanceTimersByTime(200)
    expect(spiedCreateSnapshotMethod).toBeCalled()
    expect(spiedCreateSnapshotMethod.mock.lastCall![2]).toBeDefined()
    expect(spiedCreateSnapshotMethod.mock.lastCall![2]).toHaveProperty('inlineStylesheet', false)
    expect(spiedCreateSnapshotMethod.mock.lastCall![2]).toHaveProperty('inlineImages', false)
  })
})

function createSnapshotRecorderHandler(collectorOptions?: Partial<CollectorOptions>) {
  return new SnapshotRecorderHandler(
    {
      window: global.window,
      ...collectorOptions,
    } as unknown as CollectorOptions,
    new CookieTimeoutHandler(
      1000,
      {
        cookieWriter: null,
        cookieStrategy: CookieStrategy.default,
      },
      global.window,
    ),
    new MemorySessionIdHandler(() => ''),
    new NopGravityClient({ requestInterval: 0 }),
  )
}
