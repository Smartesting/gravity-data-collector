import { SessionTraitValue } from '../types'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { IGravityClient } from '../gravity-client/IGravityClient'

export default class SessionTraitHandler {
  constructor(private readonly sessionIdHandler: ISessionIdHandler, private readonly gravityClient: IGravityClient) {}

  handle(traitName: string, traitValue: SessionTraitValue) {
    this.gravityClient
      .identifySession(this.sessionIdHandler.get(), { [traitName]: traitValue })
      .then(() => {})
      .catch(() => {})
  }
}
