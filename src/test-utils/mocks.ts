import { CypressObject, GravityDocument, TargetedUserAction } from '../types'
import createElementInJSDOM from './createElementInJSDOM'
import { createClickUserAction } from './userActions'
import { ListenerFn } from 'eventemitter2'
import { vi } from 'vitest'

export function mockWindowScreen() {
  Object.defineProperty(window, 'screen', {
    value: {
      width: 1020,
      height: 850,
      availWidth: 1440,
      availHeight: 900,
      colorDepth: 1,
      pixelDepth: 1,
      orientation: { type: 'landscape' },
    },
    writable: true,
  })
}

export function mockWindowDocument(): GravityDocument {
  const document = {
    title: 'Hello world!',
    cookie: '',
    location: {
      hostname: 'https://www.foo.com',
    },
  }
  Object.defineProperty(window, 'document', { value: document })
  return document
}

export function mockWindowLocation() {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'https://www.foo.com/bar',
      pathname: '/bar',
      search: '',
    },
    writable: true,
  })
}

export function mockClick(target: HTMLElement, clientX: number = 10, clientY: number = 10): PointerEvent {
  return {
    target,
    clientX,
    clientY,
    height: 0,
  } as unknown as PointerEvent
}

export function mockKeyUp(target: HTMLElement, key: string, code: string): KeyboardEvent {
  return {
    type: 'keyup',
    key,
    code,
    target,
  } as unknown as KeyboardEvent
}

export function mockKeyDown(target: HTMLElement, key: string, code: string): KeyboardEvent {
  return {
    type: 'keydown',
    key,
    code,
    target,
  } as unknown as KeyboardEvent
}

export function mockClickUserAction(): TargetedUserAction {
  const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')
  return createClickUserAction(element)
}

export function mockCypressObject(): CypressObject {
  const listeners: Record<string, ListenerFn[]> = {}
  // noinspection JSUnusedGlobalSymbols
  const cypress = {
    listeners: (event: string): readonly ListenerFn[] => listeners[event] ?? [],
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

type MockFetchParams<T> = Partial<{
  status: number
  responseBody: T
}>

export function mockFetch<T>(params?: MockFetchParams<T>) {
  const status = params?.status ?? 200
  const responseBody = params?.responseBody ?? {}
  return vi.fn().mockImplementation(() => ({
    status,
    json: async (): Promise<any> => await Promise.resolve(responseBody),
  }))
}
