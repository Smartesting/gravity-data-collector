import viewport from '../utils/viewport'
import location from '../utils/location'
import { UserActionType, SessionStartedUserAction } from '../types'
import { config } from '../config'
import gravityDocument from '../utils/gravityDocument'

export function createSessionStartedUserAction(): SessionStartedUserAction {
  const action: SessionStartedUserAction = {
    type: UserActionType.SessionStarted,
    recordedAt: new Date().toISOString(),
    location: location(),
    document: gravityDocument(),
    viewportData: viewport(),
    version: config.COLLECTOR_VERSION,
    agent: navigator.userAgent,
  }

  const cypress = (window as any).Cypress
  if (cypress?.currentTest !== undefined) {
    action.test = cypress.currentTest.titlePath.join(' > ')
  }

  return action
}
