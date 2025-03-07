import { GravityLocation, SessionUserAction, UserAction } from '../types'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import IUserActionHandler from './IUserActionHandler'
import { IGravityClient } from '../gravity-client/IGravityClient'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import { computePathname } from '../utils/computePathname'

export default class UserActionHandler implements IUserActionHandler {
  private active = true
  private readonly listeners: Array<Function> = []
  private pageSuffix: string | undefined

  constructor(
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly gravityClient: IGravityClient,
    private readonly useHashInUrlAsPathname: boolean,
  ) {}

  async handle(action: UserAction): Promise<void> {
    if (!this.active) return
    if (!this.timeoutHandler.isExpired()) {
      const sessionUserAction = this.toSessionUserAction(action)
      if (this.pageSuffix) {
        sessionUserAction.location.pathname += sessionUserAction.location.pathname.endsWith('/')
          ? this.pageSuffix
          : `/${this.pageSuffix}`
      }
      await this.gravityClient.addSessionUserAction(sessionUserAction)
    }
    this.listeners.forEach((listener) => listener())
  }

  private toSessionUserAction(action: UserAction): SessionUserAction {
    const location: GravityLocation = {
      ...action.location,
      ...(this.useHashInUrlAsPathname && { pathname: computePathname(action.location.href) }),
    }
    return {
      sessionId: this.sessionIdHandler.get(),
      ...action,
      location,
    }
  }

  terminate() {
    this.active = false
    this.listeners.splice(0, this.listeners.length)
    this.pageSuffix = undefined
  }

  subscribe(listener: Function) {
    this.listeners.push(listener)
  }

  activate() {
    this.active = true
  }

  setPageSuffix(pageSuffix: string | undefined) {
    this.pageSuffix = pageSuffix
  }
}
