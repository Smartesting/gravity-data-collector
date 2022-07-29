import viewport from '../utils/viewport'
import location from '../utils/location'
import { EventType, GravitySessionStartedEvent } from '../types'
import pJson from './../../package.json'
import gravityDocument from '../utils/gravityDocument'

export function createSessionStartedEvent(): GravitySessionStartedEvent {
  const initSessionEvent: GravitySessionStartedEvent = {
    type: EventType.SessionStarted,
    recordedAt: new Date().toISOString(),
    location: location(),
    document: gravityDocument(),
    viewportData: viewport(),
    version: pJson.version,
    agent: navigator.userAgent,
  }

  const cypress = (window as any).Cypress
  if (cypress?.currentTest !== undefined) {
    initSessionEvent.test = cypress.currentTest.titlePath.join(' > ')
  }

  return initSessionEvent
}
