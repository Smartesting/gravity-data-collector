import { v4 as uuid } from 'uuid'
import { SessionTraitValue } from '../types'
import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest'
import { collectorInstaller } from './CollectorInstaller'
import { asyncNop, nop } from '../utils/nop'
import SessionTraitHandler from '../session-trait/SessionTraitHandler'

describe.each([
  { context: 'dry run mode (debug=true)', installer: () => collectorInstaller({ debug: true }) },
  { context: 'live mode (debug=false)', installer: () => collectorInstaller({ debug: false, authKey: uuid() }) },
])('GravityCollector.identifySession() in $context', ({ installer }) => {
  let handleSessionTrait: SpyInstance<[traitName: string, traitValue: SessionTraitValue], Promise<void>>
  let consoleWarn: SpyInstance<any[], void>

  beforeEach(() => {
    handleSessionTrait = vi.spyOn(SessionTraitHandler.prototype, 'handle').mockImplementation(asyncNop)
    consoleWarn = vi.spyOn(global.console, 'warn').mockImplementation(nop)
  })

  afterEach(() => {
    handleSessionTrait.mockRestore()
    consoleWarn.mockRestore()
  })

  it('delegates session trait to handler', async () => {
    const collector = installer().install()
    await collector.identifySession('connected', true)
    expect(handleSessionTrait).toHaveBeenCalledWith('connected', true)
  })

  it('prevents bad format of session trait value', async () => {
    const collector = installer().install()
    await collector.identifySession('connected', { badFormat: true } as unknown as string)
    expect(consoleWarn).toHaveBeenCalledWith(
      '[Gravity Data Collector] The following session trait value is not allowed: ',
      { badFormat: true },
    )
    expect(handleSessionTrait).not.toHaveBeenCalled()
  })
})
