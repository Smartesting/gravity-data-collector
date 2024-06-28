import CollectorWrapper from './CollectorWrapper'
import { CollectorOptions, SessionTraitValue } from '../types'
import windowExists from '../utils/windowExists'
import { collectorInstaller } from './CollectorInstaller'

const SECOND = 1000
const MINUTE = 60 * SECOND
const MAX_SESSION_DURATION = 30 * MINUTE

export default class GravityCollector {
  private readonly collectorWrapper: CollectorWrapper | undefined

  constructor(collectorWrapper: CollectorWrapper) {
    this.collectorWrapper = collectorWrapper
  }

  static async stop(): Promise<void> {
    return await new Promise((resolve, reject) => {
      const collector: GravityCollector = (window as any)._GravityCollector
      if (!collector) {
        return reject(new Error('No Gravity Data Collector found in window'))
      }
      if (!collector.collectorWrapper) {
        return reject(new Error('No Wrapper found in Gravity Data Collector'))
      }
      collector.collectorWrapper.terminateRecording(true)
      resolve()
    })
  }

  static getInstance(_window: any = window): GravityCollector {
    return _window._GravityCollector
  }

  static getSessionId(_window: any = window): string | undefined {
    const instance = GravityCollector.getInstance(_window)
    return instance.collectorWrapper?.getSessionId()
  }

  static async init(options?: Partial<CollectorOptions>) {
    return await addCollector(options ?? {}, false)
  }

  static async initWithOverride(options?: Partial<CollectorOptions>, sessionId?: string) {
    return await addCollector(options ?? {}, true, sessionId)
  }

  static identifySession(traitName: string, traitValue: SessionTraitValue) {
    const collector: GravityCollector = (window as any)._GravityCollector
    if (!collector) {
      throw new Error('No Gravity Data Collector found in window')
    }
    collector.identifySession(traitName, traitValue)
  }

  public identifySession(traitName: string, traitValue: SessionTraitValue) {
    if (this.collectorWrapper === undefined) {
      throw new Error('Gravity Data Collector was not initialized : please call window.GravityCollector.init() before')
    }
    void this.collectorWrapper.identifySession(traitName, traitValue)
  }
}

async function addCollector(options: Partial<CollectorOptions>, overrideExisting: boolean, sessionId?: string) {
  if (!windowExists() && options?.window === undefined) {
    throw new Error('Gravity Data Collector needs a `window` instance in order to work')
  }
  const installer = collectorInstaller(options)
    .withCookieSessionIdHandler(overrideExisting, sessionId)
    .withCookieTimeoutHandler(MAX_SESSION_DURATION)

  if (installer.window()._GravityCollector && overrideExisting) {
    installer.window()._GravityCollector.collectorWrapper?.terminateRecording(true, true, true)
  }

  if (!(installer.window()._GravityCollector && !overrideExisting)) {
    installer.window()._GravityCollector = new GravityCollector(installer.install(overrideExisting))
  }
}
