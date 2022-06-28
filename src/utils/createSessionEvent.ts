import EventType from "./eventType"
import getLocationData from "./getLocationData"
import getViewportData from "./getViewportData"

export function createSessionEvent(): GravitySessionStartedEvent {
  const initSessionEvent: GravitySessionStartedEvent = {
    type: EventType.SessionStarted,
    recordedAt: Date.now(),
    location: getLocationData(),
    viewportData: getViewportData()
  }

  if ((<any>window).Cypress && (<any>window).Cypress.currentTest) {
    initSessionEvent.test = (<any>window).Cypress.currentTest.titlePath.join(" > ")
  }

  return initSessionEvent
}
