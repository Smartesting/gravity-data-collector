import { PageConsumption } from '../types'

export default interface IPageConsumptionHandler {
  handle: (pageConsumption: PageConsumption) => void
}

export class NopPageConsumptionHandler implements IPageConsumptionHandler {
  handle(): void {}
}
