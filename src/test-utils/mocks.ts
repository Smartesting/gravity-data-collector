import { GravityDocument } from '../types'

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

export function mockClick(target: HTMLElement): PointerEvent {
  return {
    target,
    clientX: 10,
    clientY: 10,
    height: 0,
  } as unknown as PointerEvent
}

export function mockKeyUp(): KeyboardEvent {
  return new KeyboardEvent('keyup', {})
}

export function mockKeyDown(): KeyboardEvent {
  return new KeyboardEvent('keydown', {})
}
