export default interface ISessionSizeController {
  checkThreshold: (pendingUserActionCount: number) => boolean
}

export abstract class BaseSessionSizeController implements ISessionSizeController {
  constructor(private readonly threshold: number) {}

  checkThreshold(pendingUserActionCount: number): boolean {
    if (this.isThresholdReached()) return true
    if (pendingUserActionCount >= this.threshold) {
      this.setThresholdReached()
      return true
    }
    return false
  }

  protected abstract isThresholdReached(): boolean

  protected abstract setThresholdReached(): void
}
