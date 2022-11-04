import CollectorWrapper from './CollectorWrapper'
import { CollectorOptions, SessionTraitValue } from '../types'
import windowExists from '../utils/windowExists'
import completeOptions from '../utils/completeOptions'
import SessionStorageSessionIdHandler from '../session-id-handler/SessionStorageSessionIdHandler'
import SessionStorageTestNameHandler from '../test-name-handler/SessionStorageTestNameHandler'
import { v4 as uuidv4 } from 'uuid'

const TIMEOUT = 1000 * 60 * 30

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
        new SessionStorageSessionIdHandler(uuidv4, TIMEOUT),
        new SessionStorageTestNameHandler(),
      ),
    )
  }

  static identifySession(traitName: string, traitValue: SessionTraitValue) {
    const collectorWrapper = (window as any)._GravityCollector.collectorWrapper
    if (collectorWrapper === undefined) {
      throw new Error('Gravity Data Collector was not initialized : please call window.GravityCollector.init() before')
    }
    collectorWrapper.identifySession(traitName, traitValue)
  }
}
