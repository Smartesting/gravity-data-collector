import UserActionsHistory from './UserActionHistory'
import { UserAction } from '../types'

export default class MemoryUserActionsHistory implements UserActionsHistory {
  private readonly userActionsHistory: UserAction[] = []

  constructor(private readonly historySize = 5) {}

  getLast(): UserAction {
    return this.userActionsHistory.slice(-1)[0]
  }

  getUserActionsHistory(): UserAction[] {
    return this.userActionsHistory
  }

  push(userAction: UserAction): void {
    if (this.userActionsHistory.length === this.historySize) this.userActionsHistory.splice(0, 1)
    this.userActionsHistory.push(userAction)
  }
}
