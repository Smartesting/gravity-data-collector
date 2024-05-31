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
import { nop } from '../utils/nop'

describe('UserActionHandler', () => {
  describe('handle', () => {
    let client: IGravityClient
    let sessionIdHandler: ISessionIdHandler
    let userActionHandler: IUserActionHandler
    const userAction: UserAction = createSessionStartedUserAction(window)
    const sessionId = '123-456'

    beforeEach(() => {
      client = new NopGravityClient({ requestInterval: 0 })
      sessionIdHandler = new MemorySessionIdHandler(() => sessionId)
      const timeoutHandler = new MemoryTimeoutHandler(1000)
      userActionHandler = new UserActionHandler(sessionIdHandler, timeoutHandler, client, true, { onUserAction: nop })
    })

    it('adds a session id when handling a user action', async () => {
      const spy = vitest.spyOn(client, 'addSessionUserAction')
      userActionHandler.handle(userAction)

      expect(spy).toHaveBeenCalledWith({
        ...userAction,
        sessionId,
      })
    })

    it('adapts the pathname if the "useHashInUrlAsPathname" constructor parameter is true', async () => {
      const spy = vitest.spyOn(client, 'addSessionUserAction')
      userAction.location.href = 'http://plic.com/#/ploc'
      userActionHandler.handle(userAction)

      expect(spy).toHaveBeenCalledWith({
        ...userAction,
        location: {
          href: 'http://plic.com/#/ploc',
          pathname: '/ploc',
          search: '',
        },
        sessionId,
      })
    })
  })
})
