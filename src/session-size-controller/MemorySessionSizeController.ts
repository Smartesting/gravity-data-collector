import { BaseSessionSizeController } from './ISessionSizeController'
import { UserAction } from '../types'

export class MemorySessionSizeController extends BaseSessionSizeController {
  private thresholdReached = false
  private pendingUserActions: readonly UserAction[] = []

  protected isThresholdReached(): boolean {
    return this.thresholdReached
  }

  protected setThresholdReached(): void {
    this.thresholdReached = true
  }

  protected getPendingUserActions(): readonly UserAction[] {
    return this.pendingUserActions
  }

  protected setPendingUserActions(pendingUserActions: readonly UserAction[]): void {
    this.pendingUserActions = pendingUserActions
  }
}
