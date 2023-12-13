import { beforeEach, describe, expect, it, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { createSessionStartedUserAction } from './createSessionStartedUserAction'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import { UserAction } from '../types'
import { IGravityClient } from '../gravity-client/IGravityClient'
import IUserActionHandler from './IUserActionHandler'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import NopGravityClient from '../gravity-client/NopGravityClient'
import MemoryTimeoutHandler from '../timeout-handler/MemoryTimeoutHandler'

describe('UserActionHandler', () => {
  describe('handle', () => {
    let client: IGravityClient
    let sessionIdHandler: ISessionIdHandler
    let userActionHandler: IUserActionHandler
    const userAction: UserAction = createSessionStartedUserAction()
    const sessionId = '123-456'

    beforeEach(() => {
      client = new NopGravityClient(0)
      sessionIdHandler = new MemorySessionIdHandler(() => sessionId)
      userActionHandler = new UserActionHandler(sessionIdHandler, new MemoryTimeoutHandler(1000), client)
    })

    it('adds a session id when  handling a user action', async () => {
      const spy = vitest.spyOn(client, 'addSessionUserAction')
      userActionHandler.handle(userAction)

      expect(spy).toHaveBeenCalledWith({
        ...userAction,
        sessionId,
      })
    })
  })
})
