import { SessionUserAction, UserAction } from '../types'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import IUserActionHandler from './IUserActionHandler'
import { IGravityClient } from '../gravity-client/IGravityClient'

export default class UserActionHandler implements IUserActionHandler {
  constructor(
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly gravityClient: IGravityClient,
  ) {}

  handle(action: UserAction) {
    this.gravityClient.addSessionUserAction(this.toSessionUserAction(action)).then(() => {}).catch(() => {})
  }

  flush(): void {
    this.gravityClient.flush()
  }

  private toSessionUserAction(action: UserAction): SessionUserAction {
    return {
      sessionId: this.sessionIdHandler.get(),
      ...action,
    }
  }
}
