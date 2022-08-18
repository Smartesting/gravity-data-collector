import { SessionUserAction, UserAction } from '../../types'
import IUserActionHandler from './IUserActionHandler'
import { toSessionUserAction } from '../createSessionUserAction'

export default class MemoryUserActionHandler implements IUserActionHandler {
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
    this.buffer.push(toSessionUserAction(action, this.sessionId))
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
}
