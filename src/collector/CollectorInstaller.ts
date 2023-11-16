import { CollectorOptions, CollectorOptionsWithWindow } from '../types'
import CollectorWrapper from './CollectorWrapper'
import completeOptions from '../utils/completeOptions'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import { v4 as uuid } from 'uuid'
import CookieSessionIdHandler from '../session-id-handler/CookieSessionIdHandler'
import SessionStorageTestNameHandler from '../test-name-handler/SessionStorageTestNameHandler'
import TestNameHandler from '../test-name-handler/TestNameHandler'
import crossfetch from 'cross-fetch'

export function collectorInstaller(options?: Partial<CollectorOptions>) {
  return new CollectorInstaller(options)
}

export type FetchType = typeof crossfetch

export class CollectorInstaller {
  private options: CollectorOptionsWithWindow
  private sessionIdHandler: ISessionIdHandler = new MemorySessionIdHandler(uuid, 1000)
  private testNameHandler: TestNameHandler = new SessionStorageTestNameHandler()
  private fetch = crossfetch

  constructor(options?: Partial<CollectorOptions>) {
    this.options = completeOptions(options)
  }

  withOptions(overridden: Partial<CollectorOptions>): CollectorInstaller {
    this.options = { ...this.options, ...overridden }
    return this
  }

  withCookieSessionIdHandler(sessionDuration: number, customWindow?: typeof window): CollectorInstaller {
    const windowToUse = this.options?.window ?? customWindow ?? window
    return this.withSessionIdHandler(new CookieSessionIdHandler(uuid, sessionDuration, windowToUse))
  }

  withSessionIdHandler(handler: ISessionIdHandler): CollectorInstaller {
    this.sessionIdHandler = handler
    return this
  }

  withTestNameHandler(testNameHandler: TestNameHandler): CollectorInstaller {
    this.testNameHandler = testNameHandler
    return this
  }

  withFetch(fetch: FetchType): CollectorInstaller {
    this.fetch = fetch
    return this
  }

  install(): CollectorWrapper {
    const collectorWrapper = new CollectorWrapper(this.options, this.sessionIdHandler, this.testNameHandler, this.fetch)
    collectorWrapper.init()
    return collectorWrapper
  }
}
