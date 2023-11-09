import CollectorWrapper from './CollectorWrapper'
import { CollectorOptions, SessionTraitValue } from '../types'
import windowExists from '../utils/windowExists'
import { collectorInstaller } from './CollectorInstaller'

const SECOND = 1000
const MINUTE = 60 * SECOND
const MAX_SESSION_DURATION = 30 * MINUTE

export default class GravityCollector {
  collectorWrapper: CollectorWrapper | undefined

  constructor(collectorWrapper: CollectorWrapper) {
    this.collectorWrapper = collectorWrapper
  }

  static getInstance(_window: any = window) {
    return _window._GravityCollector
  }

  static async init(options?: Partial<CollectorOptions>) {
    if (!windowExists() && options?.window === undefined) {
      throw new Error('Gravity Data Collector needs a `window` instance in order to work')
    }
    const wrapper = await collectorInstaller(options).withCookieSessionIdHandler(MAX_SESSION_DURATION).install()
    if (wrapper) {
      const windowToUse = (options?.window ?? window) as any
      windowToUse._GravityCollector = new GravityCollector(wrapper)
    }
  }

  static identifySession(traitName: string, traitValue: SessionTraitValue, _window: any = window) {
    const collectorWrapper = this.getInstance(_window).collectorWrapper
    if (collectorWrapper === undefined) {
      throw new Error('Gravity Data Collector was not initialized : please call window.GravityCollector.init() before')
    }
    collectorWrapper.identifySession(traitName, traitValue)
  }
}
