import { describe, expect, it, vi } from 'vitest'
import { CypressEvent, CypressObject } from '../types'
import CypressEventListener from './CypressEventListener'
import { NopUserActionHandler } from '../user-action/IUserActionHandler'
import { ListenerFn } from 'eventemitter2'

describe('CypressEventListener', () => {
  const cypress = mockCypress()

  it('handle userAction when listener has been initialized', async () => {
    const userActionHandler = new NopUserActionHandler()
    const spyOnHandle = vi.spyOn(userActionHandler, 'handle')
    const eventListener: CypressEventListener = new CypressEventListener(cypress, userActionHandler)
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
    const eventListener: CypressEventListener = new CypressEventListener(cypress, userActionHandler)
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
})

function mockCypress() {
  const listeners: Record<string, ListenerFn[]> = {}
  // noinspection JSUnusedGlobalSymbols
  const cypress = {
    addListener: (event: string, listener: ListenerFn) => {
      Array.isArray(listeners[event]) ? listeners[event].push(listener) : (listeners[event] = [listener])
    },
    removeListener: (event: string, listener: ListenerFn) => {
      if (Array.isArray(listeners[event])) {
        const index = listeners[event].indexOf(listener)
        if (index !== -1) {
          listeners[event].splice(index, 1)
        }
      }
    },
    emit(event: string, ...values: any[]): boolean {
      if (Array.isArray(listeners[event])) {
        for (const listener of listeners[event]) {
          listener(...values)
        }
        return true
      }
      return false
    },
  }
  return cypress as CypressObject
}
