import { SessionUserAction, UserAction } from '../types'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import IUserActionHandler from './IUserActionHandler'
import { IGravityClient } from '../gravity-client/IGravityClient'

export default class UserActionHandler implements IUserActionHandler {
  private active = true
  private readonly listeners: Array<Function> = []
  constructor(private readonly sessionIdHandler: ISessionIdHandler, private readonly gravityClient: IGravityClient) {}

  async handle(action: UserAction): Promise<void> {
    if (!this.active) return
    this.listeners.forEach((listener) => listener())
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
    this.listeners.splice(0, this.listeners.length)
  }

  subscribe(listener: Function) {
    this.listeners.push(listener)
  }

  activate() {
    this.active = true
  }
}
