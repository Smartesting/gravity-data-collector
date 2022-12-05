import { UserAction } from '../types'

export default interface ISessionSizeController {
  checkThreshold: (newUserActions: readonly UserAction[]) => readonly UserAction[]
}

export abstract class BaseSessionSizeController implements ISessionSizeController {
  constructor(private readonly threshold: number) {}

  checkThreshold(newUserActions: readonly UserAction[]): readonly UserAction[] {
    if (this.isThresholdReached()) return newUserActions

    const pendingUserActions = this.getPendingUserActions().concat(newUserActions)
    if (pendingUserActions.length < this.threshold) {
      this.setPendingUserActions(pendingUserActions)
      return []
    }
    this.setThresholdReached()
    this.setPendingUserActions([])
    return pendingUserActions
  }

  protected abstract isThresholdReached(): boolean

  protected abstract setThresholdReached(): void

  protected abstract getPendingUserActions(): readonly UserAction[]

  protected abstract setPendingUserActions(pendingUserActions: readonly UserAction[]): void
}
