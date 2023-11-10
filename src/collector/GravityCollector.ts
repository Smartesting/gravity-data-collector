import CollectorWrapper from './CollectorWrapper'
import { CollectorOptions, SessionTraitValue } from '../types'
import windowExists from '../utils/windowExists'
import { collectorInstaller } from './CollectorInstaller'

const SECOND = 1000
const MINUTE = 60 * SECOND
const MAX_SESSION_DURATION = 30 * MINUTE

export default class GravityCollector {
  private readonly asyncCollectorWrapper: Promise<CollectorWrapper>

  constructor(asyncCollectorWrapper: Promise<CollectorWrapper>) {
    this.asyncCollectorWrapper = asyncCollectorWrapper
  }

  static getInstance(_window: any = window) {
    return _window._GravityCollector
  }

  static init(options?: Partial<CollectorOptions>) {
    if (!windowExists() && options?.window === undefined) {
      throw new Error('Gravity Data Collector needs a `window` instance in order to work')
    }
    const windowToUse = (options?.window ?? window) as any
    windowToUse._GravityCollector = new GravityCollector(
      collectorInstaller(options).withCookieSessionIdHandler(MAX_SESSION_DURATION).install(),
    )
  }

  static identifySession(traitName: string, traitValue: SessionTraitValue) {
    const collector: GravityCollector = (window as any)._GravityCollector
    collector.identifySession(traitName, traitValue).catch(console.error)
  }

  async identifySession(traitName: string, traitValue: SessionTraitValue) {
    const collectorWrapper = await this.asyncCollectorWrapper
    if (collectorWrapper === undefined) {
      throw new Error('Gravity Data Collector was not initialized : please call window.GravityCollector.init() before')
    }
    collectorWrapper.identifySession(traitName, traitValue)
  }
}
