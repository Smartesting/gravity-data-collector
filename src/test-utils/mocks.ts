import { GravityRecordingSettings, GravityRecordingSettingsError, GravityRecordingSettingsResponse } from '../types'
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
    getBoundingClientRect: target.getBoundingClientRect,
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

type MockFetchParams<BODY> = Partial<{
  status: number
  responseBody: (...args: any[]) => BODY
}>

export function mockFetch<T>(params?: MockFetchParams<T>) {
  const status = params?.status ?? 200
  return vi.fn().mockImplementation((args) => {
    return {
      status,
      json: async () => params?.responseBody?.(args) ?? {},
    }
  })
}

export function buildGravityRecordingSettings(settings: Partial<GravityRecordingSettings>): GravityRecordingSettings {
  return {
    sessionRecording: true,
    videoRecording: false,
    ...settings,
  }
}

export function buildGravityRecordingSettingsResponse(
  settings: Partial<GravityRecordingSettings> | null,
): GravityRecordingSettingsResponse {
  if (settings === null) {
    return {
      error: GravityRecordingSettingsError.accessDenied,
      settings: null,
    }
  }
  return {
    error: null,
    settings: buildGravityRecordingSettings(settings),
  }
}
