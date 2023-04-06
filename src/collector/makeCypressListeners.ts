import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { CypressObject, IEventHandler } from '../types'
import { CypressListener } from '../cypress-listeners/CypressListener'

export function makeCypressListeners(
  cypress: CypressObject | undefined,
  sessionIdHandler: ISessionIdHandler,
  eventHandler?: IEventHandler,
) {
  if (cypress == null) return []
  return [
    new CypressListener(cypress, 'command:start', sessionIdHandler, eventHandler),
    new CypressListener(cypress, 'command:end', sessionIdHandler, eventHandler),
    new CypressListener(cypress, 'test:after:run', sessionIdHandler, eventHandler),
  ]
}
