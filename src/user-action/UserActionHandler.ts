import { SessionUserAction, UserAction } from '../types'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'

export default class UserActionHandler {
  private readonly buffer: SessionUserAction[] = []
  private readonly timer?: NodeJS.Timer

  constructor(
    private readonly sessionId: string,
    private readonly requestInterval: number,
    private readonly output: (sessionActions: SessionUserAction[]) => void,
    private readonly onPublish?: (sessionActions: SessionUserAction[]) => void,
    private readonly userActionHistory?: UserActionsHistory,
  ) {
    if (requestInterval > 0) {
      this.timer = setInterval(() => {
        void this.flush()
      }, requestInterval)
    }
  }

  handle(action: UserAction) {
    this.buffer.push(this.toSessionUserAction(action))
    if (this.userActionHistory !== undefined) this.userActionHistory.push(action)
    if (this.timer == null) {
      this.flush()
    }
  }

  flush() {
    if (this.buffer.length === 0) {
      return
    }
    const sessionUserActions = this.buffer.splice(0, this.buffer.length)
    this.output(sessionUserActions)
    if (this.onPublish) {
      this.onPublish(sessionUserActions)
    }
  }

  private toSessionUserAction(action: UserAction): SessionUserAction {
    return {
      sessionId: this.sessionId,
      ...action,
    }
  }
}
