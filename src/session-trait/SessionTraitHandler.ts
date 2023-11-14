import { SessionTraitValue } from '../types'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { IGravityClient } from '../gravity-client/IGravityClient'

export default class SessionTraitHandler {
  private active = true
  constructor(private readonly sessionIdHandler: ISessionIdHandler, private readonly gravityClient: IGravityClient) {}

  async handle(traitName: string, traitValue: SessionTraitValue): Promise<void> {
    if (!this.active) return
    return await this.gravityClient.identifySession(this.sessionIdHandler.get(), { [traitName]: traitValue })
  }

  terminate() {
    this.active = false
  }
}
