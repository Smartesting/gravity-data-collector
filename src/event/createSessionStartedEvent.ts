import viewport from '../utils/viewport'
import location from '../utils/location'
import { EventType, GravitySessionStartedEvent } from '../types'
import { config } from '../config'

export function createSessionStartedEvent(): GravitySessionStartedEvent {
  const initSessionEvent: GravitySessionStartedEvent = {
    type: EventType.SessionStarted,
    recordedAt: new Date().toISOString(),
    location: location(),
    viewportData: viewport(),
    version: config.COLLECTOR_VERSION,
    agent: navigator.userAgent,
  }

  const cypress = (window as any).Cypress
  if (cypress?.currentTest !== undefined) {
    initSessionEvent.test = cypress.currentTest.titlePath.join(' > ')
  }

  return initSessionEvent
}
