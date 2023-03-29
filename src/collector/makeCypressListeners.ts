import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { CypressObject, IEventHandler } from '../types'
import { IEventListener } from '../event-listeners-handler/IEventListener'
import { CypressListener } from '../cypress-listeners/CypressListener'
import { makeMochaListeners } from './makeMochaListeners'

export function makeCypressListeners(
  cypress: CypressObject | undefined,
  sessionIdHandler: ISessionIdHandler,
  eventHandler?: IEventHandler,
) {
  if (cypress == null) {
    return []
  }
  console.log('Install Cypress listeners', { cypress }) // FIXME remove
  const cypressListeners: IEventListener[] = [
    new CypressListener(cypress, 'command:start', sessionIdHandler, eventHandler),
    new CypressListener(cypress, 'command:end', sessionIdHandler, eventHandler),
    new CypressListener(cypress, 'test:after:run', sessionIdHandler, eventHandler),
  ]
  return cypressListeners.concat(makeMochaListeners(cypress, sessionIdHandler, eventHandler))
}
