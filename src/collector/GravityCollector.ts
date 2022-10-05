import CollectorWrapper from './CollectorWrapper'
import { CollectorOptions, TraitValue } from '../types'
import windowExists from '../utils/windowExists'
import completeOptions from '../utils/completeOptions'
import SessionStorageSessionIdHandler from '../session-id-handler/SessionStorageSessionIdHandler'
import SessionStorageTestNameHandler from '../test-name-handler/SessionStorageTestNameHandler'

export default class GravityCollector {
  collectorWrapper: CollectorWrapper | undefined

  constructor(collectorWrapper: CollectorWrapper) {
    this.collectorWrapper = collectorWrapper
  }

  static get instance() {
    return (window as any)._GravityCollector
  }

  static init(options?: Partial<CollectorOptions>) {
    if (!windowExists()) {
      throw new Error('Gravity Data Collector needs a `window` instance in order to work')
    }
    ;(window as any)._GravityCollector = new GravityCollector(
      new CollectorWrapper(
        completeOptions(options),
        window,
        new SessionStorageSessionIdHandler(),
        new SessionStorageTestNameHandler(),
      ),
    )
  }

  static identifySession(traitName: string, traitValue: TraitValue) {
    const collectorWrapper = (window as any)._GravityCollector.collectorWrapper
    if (!collectorWrapper) {
      throw new Error('Gravity Data Collector was not initialized : please call window.GravityCollector.init() before')
    }
    collectorWrapper.identifySession(traitName, traitValue)
  }
}
