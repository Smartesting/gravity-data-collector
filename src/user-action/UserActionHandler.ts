import { SessionUserAction, UserAction } from '../types'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import IUserActionHandler from './IUserActionHandler'
import { IGravityClient } from '../gravity-client/IGravityClient'

export default class UserActionHandler implements IUserActionHandler {
  private active = true
  constructor(private readonly sessionIdHandler: ISessionIdHandler, private readonly gravityClient: IGravityClient) {}

  async handle(action: UserAction): Promise<void> {
    if (!this.active) return
    return await this.gravityClient.addSessionUserAction(this.toSessionUserAction(action))
  }

  private toSessionUserAction(action: UserAction): SessionUserAction {
    return {
      sessionId: this.sessionIdHandler.get(),
      ...action,
    }
  }

  terminate() {
    this.active = false
  }
}
