import { SessionUserAction, UserAction } from '../../types'
import IUserActionHandler from './IUserActionHandler'
import { toSessionUserAction } from '../createSessionUserAction'

const GRAVITY_SESSION_STORAGE_KEY_USER_ACTIONS_BUFFER = 'gravity-user-actions-buffer'

export default class SessionStorageUserActionHandler implements IUserActionHandler {
  private readonly timer?: NodeJS.Timer

  constructor(
    private readonly sessionId: string,
    private readonly requestInterval: number,
    private readonly output: (sessionActions: SessionUserAction[]) => void,
  ) {
    const buffer = this.getBuffer()
    if (buffer === null) this.setBuffer([])

    if (requestInterval > 0) {
      this.timer = setInterval(() => {
        void this.flush()
      }, requestInterval)
    }
  }

  handle(action: UserAction) {
    this.pushToBuffer(toSessionUserAction(action, this.sessionId))
    if (this.timer == null) {
      this.flush()
    }
  }

  flush() {
    const buffer = this.getBuffer()
    if (buffer === null || buffer.length === 0) return

    this.output(buffer)
    this.setBuffer([])
  }

  private getBuffer(): SessionUserAction[] | null {
    const strBuffer = window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_USER_ACTIONS_BUFFER)

    if (strBuffer === null) return null

    return JSON.parse(strBuffer)
  }

  private pushToBuffer(sessionUserAction: SessionUserAction) {
    const buffer = this.getBuffer()
    if (buffer === null) throw new Error('Set user actions buffer before to use it')

    buffer.push(sessionUserAction)
    this.setBuffer(buffer)
  }

  private setBuffer(sessionUserActions: SessionUserAction[]) {
    window.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_USER_ACTIONS_BUFFER, JSON.stringify(sessionUserActions))
  }
}
