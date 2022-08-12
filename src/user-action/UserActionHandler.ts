import { SessionUserAction, UserAction } from '../types'

export default class UserActionHandler {
  private readonly buffer: SessionUserAction[] = []
  private readonly timer?: NodeJS.Timer

  constructor(
    private readonly sessionId: string,
    private readonly requestInterval: number,
    private readonly output: (sessionActions: SessionUserAction[]) => void,
  ) {
    if (requestInterval > 0) {
      this.timer = setInterval(() => {
        void this.flush()
      }, requestInterval)
    }
  }

  handle(action: UserAction) {
    this.buffer.push(this.toSessionUserAction(action))
    if (this.timer == null) {
      this.flush()
    }
  }

  flush() {
    if (this.buffer.length === 0) {
      return
    }
    this.output(this.buffer.splice(0, this.buffer.length))
  }

  private toSessionUserAction(action: UserAction): SessionUserAction {
    return {
      sessionId: this.sessionId,
      ...action,
    }
  }
}
