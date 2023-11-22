import { describe, expect, it, vi } from 'vitest'
import { CypressEvent } from '../types'
import CypressEventListener from './CypressEventListener'
import { NopUserActionHandler } from '../user-action/IUserActionHandler'
import { mockCypressObject } from '../test-utils/mocks'

describe('CypressEventListener', () => {
  const cypress = mockCypressObject()

  it('handle userAction when listener has been initialized', async () => {
    const userActionHandler = new NopUserActionHandler()
    const spyOnHandle = vi.spyOn(userActionHandler, 'handle')
    const eventListener: CypressEventListener = new CypressEventListener(cypress, userActionHandler, () => {})
    eventListener.init()
    cypress.emit(CypressEvent.COMMAND_START, {
      attributes: {
        name: 'goToHome',
        type: 'parent',
      },
    })

    expect(spyOnHandle).toHaveBeenCalledOnce()
  })

  it('does not handle userAction when listener has been terminated', async () => {
    const userActionHandler = new NopUserActionHandler()
    const spyOnHandle = vi.spyOn(userActionHandler, 'handle')
    const eventListener: CypressEventListener = new CypressEventListener(cypress, userActionHandler, () => {})
    eventListener.init()
    eventListener.terminate()
    cypress.emit(CypressEvent.COMMAND_START, {
      attributes: {
        name: 'goToHome',
        type: 'parent',
      },
    })

    expect(spyOnHandle).not.toHaveBeenCalled()
  })

  it('reduce command args to avoid "Payload Too Large" (as much as possible) ', async () => {
    const userActionHandler = new NopUserActionHandler()
    const spyOnHandle = vi.spyOn(userActionHandler, 'handle')
    const eventListener: CypressEventListener = new CypressEventListener(cypress, userActionHandler, () => {})
    eventListener.init()
    cypress.emit(CypressEvent.COMMAND_START, {
      attributes: {
        name: 'cmd',
        type: 'parent',
        args: ['x'.repeat(1001), { tooLongObject: 'y'.repeat(1001) }],
      },
    })

    expect(spyOnHandle).toHaveBeenCalledOnce()
    expect(spyOnHandle.mock.lastCall).toMatchObject([
      {
        command: {
          args: ['Gravity Collector replaced these too long args (2027 chars)'],
          chainerId: undefined,
          event: 'command:start',
          id: undefined,
          name: 'cmd',
          nextId: undefined,
          prevId: undefined,
          type: 'parent',
          userInvocationStack: undefined,
        },
        document: {
          title: '',
        },
        location: {
          href: 'http://localhost:3000/',
          pathname: '/',
          search: '',
        },
        type: 'testCommand',
        viewportData: {},
      },
    ])
  })
})
