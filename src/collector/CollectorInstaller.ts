import { CollectorOptions, CollectorOptionsWithWindow } from '../types'
import CollectorWrapper from './CollectorWrapper'
import completeOptions from '../utils/completeOptions'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import { v4 as uuid } from 'uuid'
import CookieSessionIdHandler from '../session-id-handler/CookieSessionIdHandler'
import TrackingHandler from '../tracking-handler/TrackingHandler'
import { config } from '../config'
import crossfetch from 'cross-fetch'
import ConsoleGravityClient, { DEFAULT_SESSION_COLLECTION_SETTINGS } from '../gravity-client/ConsoleGravityClient'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import SessionStorageTestNameHandler from '../test-name-handler/SessionStorageTestNameHandler'
import TestNameHandler from '../test-name-handler/TestNameHandler'

type FetchType = typeof crossfetch

export function collectorInstaller(options?: Partial<CollectorOptions>) {
  return new CollectorInstaller(options)
}

export class CollectorInstaller {
  private options: CollectorOptionsWithWindow
  private sessionIdHandler: ISessionIdHandler
  private readonly trackingHandler = new TrackingHandler(config.ERRORS_TERMINATE_TRACKING)
  private fetch: FetchType = crossfetch
  private testNameHandler: TestNameHandler = new SessionStorageTestNameHandler()

  constructor(options?: Partial<CollectorOptions>) {
    this.options = completeOptions(options)
    this.sessionIdHandler = new MemorySessionIdHandler(uuid, 1000)
  }

  withOptions(options: Partial<CollectorOptions>): CollectorInstaller {
    this.options = { ...this.options, ...options }
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

  async install(logWarning = true): Promise<CollectorWrapper> {
    const log = logWarning ? makeLogger() : () => {}

    const gravityClient = makeGravityClient(this.options, this.fetch, this.trackingHandler)
    const { error, settings } = await gravityClient.readSessionCollectionSettings()
    if (error) throw new Error(error)

    const collectorWrapper = new CollectorWrapper(
      this.options,
      this.trackingHandler,
      this.sessionIdHandler,
      gravityClient,
      this.testNameHandler,
    )
    const currentUrl = this.options.window.document.URL
    if (trackingIsAllowed(currentUrl)) {
      collectorWrapper.init(settings ?? DEFAULT_SESSION_COLLECTION_SETTINGS)
    } else {
      log('Tracking not allow for url=', currentUrl)
    }
    return collectorWrapper
  }
}

function makeLogger(log = console.log) {
  return (...args: any[]) => log('[Gravity Data Collector]', ...args)
}

function trackingIsAllowed(url: string | undefined): boolean {
  return url === undefined || !url.startsWith('about:')
}

function makeGravityClient(options: CollectorOptionsWithWindow, fetch: FetchType, trackingHandler: TrackingHandler) {
  return options.debug
    ? new ConsoleGravityClient(options.requestInterval, options.maxDelay)
    : new HttpGravityClient(
        options.requestInterval,
        {
          ...options,
          onError: (status) => trackingHandler.senderErrorCallback(status),
        },
        fetch,
      )
}
