import { BaseSessionSizeController } from './ISessionSizeController'

export class MemorySessionSizeController extends BaseSessionSizeController {
  private thresholdReached = false

  protected isThresholdReached(): boolean {
    return this.thresholdReached
  }

  protected setThresholdReached(): void {
    this.thresholdReached = true
  }
}
