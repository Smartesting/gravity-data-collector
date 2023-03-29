import { TargetedUserAction, UserActionType } from '../types'

class ChangeEventInitiatorHandler {
  private flag: TargetedUserAction | null = null

  handle(userAction: TargetedUserAction): void {
    switch (userAction.type) {
      case UserActionType.Change:
        this.enhanceChangeUserAction(userAction)
        break
      case UserActionType.KeyDown:
      case UserActionType.KeyUp:
        this.updateFlag(userAction)
        break
      default:
        this.resetFlag()
    }
  }

  private updateFlag(userAction: TargetedUserAction) {
    if (this.flag === null) {
      this.flag = userAction
      return
    }
    if (this.flag.cypressSelector === userAction.cypressSelector) return
    this.flag = userAction
  }

  private resetFlag() {
    this.flag = null
  }

  private enhanceChangeUserAction(userAction: TargetedUserAction) {
    if (this.flag == null) return
    if (this.flag.cypressSelector === userAction.cypressSelector) {
      userAction.initiatedAt = this.flag.recordedAt
    }
    this.resetFlag()
  }
}

export const CHANGE_EVENT_INITIATOR = new ChangeEventInitiatorHandler()
