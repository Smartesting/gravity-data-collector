import CollectorWrapper from './CollectorWrapper'
import { CollectorOptions } from '../types'

export default class GravityCollector {
  collectorWrapper: CollectorWrapper | undefined

  constructor(collectorWrapper: CollectorWrapper) {
    this.collectorWrapper = collectorWrapper
  }

  static get instance() {
    return (window as any)._GravityCollector
  }

  static init(authKey: string, options?: CollectorOptions) {
    if (!window) {
      throw new Error('Gravity Data Collector needs a `window` instance in order to work')
    }

    (window as any)._GravityCollector = new GravityCollector(new CollectorWrapper(authKey, options, window))
  }
}
