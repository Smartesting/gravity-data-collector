import { IEventHandler, EventProvider, EventProviderKey, SessionUserAction, UserAction } from '../types'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { config } from '../config'
import NopEventHandler from '../event-handlers/NopEventHandler'

const GRAVITY_EVENT_PROVIDER: EventProvider = {
  id: EventProviderKey.GRAVITY,
  version: config.COLLECTOR_VERSION,
}

export default class UserActionHandler {
  private readonly buffer: UserAction[] = []
  private readonly timer?: NodeJS.Timer

  constructor(
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly requestInterval: number,
    private readonly output: (sessionActions: SessionUserAction[]) => void,
    private readonly onPublish?: (sessionActions: SessionUserAction[]) => void,
    private readonly userActionHistory?: UserActionsHistory,
    private readonly eventHandler: IEventHandler = new NopEventHandler(),
  ) {
    if (requestInterval > 0) {
      this.timer = setInterval(() => {
        void this.flush()
      }, requestInterval)
    }
  }

  handle(action: UserAction) {
    this.eventHandler.handle(GRAVITY_EVENT_PROVIDER, action.type, action)
    this.buffer.push(action)
    if (this.userActionHistory !== undefined) this.userActionHistory.push(action)
    if (this.timer == null) {
      this.flush()
    }
  }

  flush() {
    if (this.buffer.length === 0) return
    const sessionUserActions = this.buffer.splice(0).map((userAction) => this.toSessionUserAction(userAction))
    this.output(sessionUserActions)
    if (this.onPublish !== undefined) {
      this.onPublish(sessionUserActions)
    }
  }

  private toSessionUserAction(action: UserAction): SessionUserAction {
    return {
      sessionId: this.sessionIdHandler.get(),
      ...action,
    }
  }
}
