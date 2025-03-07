import { v4 as uuid } from 'uuid'
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { collectorInstaller } from './CollectorInstaller'
import { SessionUserAction, TargetedUserAction, UserActionType } from '../types'
import AbstractGravityClient from '../gravity-client/AbstractGravityClient'
import { asyncNop } from '../utils/nop'
import { getLastCallFirstArgument } from '../test-utils/spies'
import { createDummy } from '../test-utils/dummyFactory'

describe.each([
  { context: 'dry run mode (debug=true)', installer: () => collectorInstaller({ debug: true }) },
  { context: 'live mode (debug=false)', installer: () => collectorInstaller({ debug: false, authKey: uuid() }) },
])('GravityCollector.identifyPage() in $context', ({ installer }) => {
  let handleUserAction: MockInstance<(userAction: SessionUserAction) => Promise<void>>

  beforeEach(() => {
    handleUserAction = vi.spyOn(AbstractGravityClient.prototype, 'addSessionUserAction').mockImplementation(asyncNop)
  })

  afterEach(() => {
    handleUserAction.mockRestore()
  })

  it('identifyPage using suffix', async () => {
    const collector = installer().install()
    expect(handleUserAction).toHaveBeenCalledOnce()

    const userAction = createDummy<TargetedUserAction>({
      type: UserActionType.Change,
      location: { href: '', pathname: 'base/path', search: '' },
    })

    // No suffix at start
    await collector.userActionHandler.handle(userAction)
    expect(getLastCallFirstArgument(handleUserAction).location.pathname).toBe('base/path')

    // Add suffix
    collector.identifyPage('addedSuffix')
    await collector.userActionHandler.handle(userAction)
    expect(getLastCallFirstArgument(handleUserAction).location.pathname).toBe('base/path/addedSuffix')

    // Reset suffix, should be origin pathname
    collector.identifyPage(undefined)
    await collector.userActionHandler.handle(userAction)
    expect(getLastCallFirstArgument(handleUserAction).location.pathname).toBe('base/path')

    // Should remove last trailing slash to avoid getting multiples
    userAction.location.pathname = 'base/path/with/trailing/slash/'
    collector.identifyPage('addedSuffix')
    await collector.userActionHandler.handle(userAction)
    expect(getLastCallFirstArgument(handleUserAction).location.pathname).toBe(
      'base/path/with/trailing/slash/addedSuffix',
    )
  })
})
