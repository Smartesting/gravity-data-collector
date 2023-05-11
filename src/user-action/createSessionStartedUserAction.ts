import viewport from '../utils/viewport'
import location from '../utils/location'
import { SessionStartedUserAction, UserActionType } from '../types'
import { config } from '../config'
import gravityDocument from '../utils/gravityDocument'

function buildId() {
  return (
    rejectBlankString(process.env.GRAVITY_BUILD_ID) ??
    rejectBlankString(process.env.REACT_APP_GRAVITY_BUILD_ID) ??
    undefined
  )
}

function rejectBlankString(value: string | undefined): string | null {
  if (value !== undefined && value !== '') return value
  return null
}

export function createSessionStartedUserAction(): SessionStartedUserAction {
  const action: SessionStartedUserAction = {
    type: UserActionType.SessionStarted,
    recordedAt: new Date().toISOString(),
    location: location(),
    document: gravityDocument(),
    viewportData: viewport(),
    version: config.COLLECTOR_VERSION,
    agent: navigator.userAgent,
    buildId: buildId(),
  }

  const cypress = (window as any).Cypress
  if (cypress?.currentTest !== undefined) {
    action.test = cypress.currentTest.titlePath.join(' > ')
  }

  return action
}