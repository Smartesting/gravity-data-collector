import CollectorWrapper from "./lib/CollectorWrapper";

export default class GravityCollector {
  loggerWrapper: CollectorWrapper | undefined;

  constructor(collectorWrapper: CollectorWrapper) {
    this.loggerWrapper = collectorWrapper;
  }

  static init(authKey: string, options?: TCollectorOptions) {
    if (!window) {
      throw new Error("Gravity Data Collector needs a `window` instance in order to work");
    }

    (window as any)._GravityCollector = new GravityCollector(new CollectorWrapper(authKey, options));
  }

  static get instance() {
    return (window as any)._GravityCollector;
  }
}
