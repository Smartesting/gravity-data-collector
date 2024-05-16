import {
  GravityDocument,
  GravityRecordingSettings,
  GravityRecordingSettingsError,
  GravityRecordingSettingsResponse,
} from '../types'
import { vi } from 'vitest'
import SnapshotRecorderHandler from '../snapshot-recorder/SnapshotRecorderHandler'
import assert from 'assert'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import { dummyDocumentSnapshot } from './dummyFactory'
import ConsoleGravityClient from '../gravity-client/ConsoleGravityClient'

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

type MockFetchParams<T> = Partial<{
  status: number
  responseBody: T
}>

export function mockFetch<T>(params?: MockFetchParams<T>) {
  const status = params?.status ?? 200
  const responseBody = params?.responseBody ?? {}
  return vi.fn().mockImplementation(() => {
    return {
      status,
      json: async () => responseBody,
    }
  })
}

export function mockBuildAndSendSnapshot(this: SnapshotRecorderHandler) {
  // @ts-expect-error
  const gravityClient = this.gravityClient
  assert(gravityClient instanceof HttpGravityClient || gravityClient instanceof ConsoleGravityClient)
  // @ts-expect-error
  const sessionIdHandler = this.sessionIdHandler
  void gravityClient.handleSnapshots(sessionIdHandler.get(), [dummyDocumentSnapshot()])
}

export function buildGravityRecordingSettings(settings: Partial<GravityRecordingSettings>) {
  return {
    sessionRecording: true,
    videoRecording: false,
    snapshotRecording: false,
    videoAnonymization: false,
    snapshotAnonymization: false,
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
