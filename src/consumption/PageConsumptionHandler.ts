import { PageConsumption } from '../types'
import IPageConsumptionHandler from './IPageConsumptionHandler'
import { IGravityClient } from '../gravity-client/IGravityClient'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'

export default class PageConsumptionHandler implements IPageConsumptionHandler {
  private active = true
  private readonly listeners: Array<Function> = []

  constructor(
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly gravityClient: IGravityClient,
  ) { }

  async handle(pageConsumption: PageConsumption): Promise<void> {
    if (!this.active) return
    if (!this.timeoutHandler.isExpired()) {
      await this.gravityClient.addPageConsumption(pageConsumption)
    }
    this.listeners.forEach((listener) => listener())
  }

  terminate() {
    this.active = false
    this.listeners.splice(0, this.listeners.length)
  }

  subscribe(listener: Function) {
    this.listeners.push(listener)
  }

  activate() {
    this.active = true
  }
}
