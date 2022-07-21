import CollectorWrapper from './CollectorWrapper'
import { CollectorOptions } from '../types'
import windowExists from '../utils/windowExists'
import completeOptions from '../utils/completeOptions'

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
    ;(window as any)._GravityCollector = new GravityCollector(new CollectorWrapper(completeOptions(options), window))
  }
}
