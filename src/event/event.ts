import unique from '@cypress/unique-selector'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { getHTMLElementAttributes } from '../utils/dom'
import {
  EventType,
  GravityClickEventData,
  GravityEvent,
  GravityEventData,
  GravityEventTarget,
  GravitySessionStartedEvent
} from '../types'
import pJson from './../../package.json'

export async function createGravityEvent(event: Event, type: EventType): Promise<GravityEvent> {
  const gravityEvent: GravityEvent = {
    type,
    location: location(),
    recordedAt: Date.now(),
    viewportData: viewport(),
    eventData: createEventData(event, type)
  }

  const target = event.target as HTMLElement

  if (target !== null) gravityEvent.target = createEventTarget(target)

  return gravityEvent
}

export function createEventTarget(target: HTMLElement): GravityEventTarget {
  const eventTarget: GravityEventTarget = {
    element: target.tagName.toLocaleLowerCase(),
    textContent: target.textContent ?? '',
    attributes: {
      ...getHTMLElementAttributes(target)
    }
  }

  try {
    eventTarget.selector = unique(target)
  } catch {
    // do nothing
  }
  return eventTarget
}

function createEventData(event: Event, type: EventType): GravityEventData | undefined {
  switch (type) {
    case EventType.Click:
      return createMouseEventData(event as MouseEvent)
  }
}

function createMouseEventData(event: MouseEvent): GravityClickEventData {
  const eventData: GravityClickEventData = {
    clickOffsetX: Math.trunc(event.clientX),
    clickOffsetY: Math.trunc(event.clientY)
  }

  const target = event.target as HTMLElement
  if (target !== null) {
    const targetOffset = target.getBoundingClientRect()
    eventData.elementOffsetX = Math.trunc(targetOffset.left)
    eventData.elementOffsetY = Math.trunc(targetOffset.top)
    eventData.elementRelOffsetX = Math.trunc(event.clientX - targetOffset.left)
    eventData.elementRelOffsetY = Math.trunc(event.clientY - targetOffset.top)
  }
  return eventData
}

export function createSessionEvent(): GravitySessionStartedEvent {
  const initSessionEvent: GravitySessionStartedEvent = {
    type: EventType.SessionStarted,
    recordedAt: Date.now(),
    location: location(),
    viewportData: viewport(),
    version: pJson.version
  }

  const cypress = (window as any).Cypress
  if (cypress?.currentTest !== undefined) {
    initSessionEvent.test = cypress.currentTest.titlePath.join(' > ')
  }

  return initSessionEvent
}
