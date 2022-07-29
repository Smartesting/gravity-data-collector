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

export function mockFocusOut(target: HTMLElement): FocusEvent {
  return {
    AT_TARGET: 0,
    BUBBLING_PHASE: 0,
    CAPTURING_PHASE: 0,
    NONE: 0,
    bubbles: false,
    cancelBubble: false,
    cancelable: false,
    composed: false,
    currentTarget: null,
    defaultPrevented: false,
    detail: 0,
    eventPhase: 0,
    isTrusted: false,
    relatedTarget: null,
    returnValue: false,
    srcElement: null,
    timeStamp: 0,
    type: '',
    view: null,
    which: 0,
    target,
  } as unknown as FocusEvent
}
