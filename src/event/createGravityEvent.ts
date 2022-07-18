import viewport from '../utils/viewport'
import location from '../utils/location'
import unique from '@cypress/unique-selector'
import { getHTMLElementAttributes, isInteractiveElement } from '../utils/dom'
import {
  EventType,
  GravityEvent,
  GravityClickEventData,
  GravityEventData,
  GravityEventTarget,
} from '../types'

export async function createGravityEvent(event: Event, type: EventType): Promise<GravityEvent> {
  const gravityEvent: GravityEvent = {
    type,
    location: location(),
    recordedAt: new Date().toISOString(),
    viewportData: viewport(),
    eventData: createEventData(event, type),
  }

  const target = event.target as HTMLElement

  if (target !== null) { gravityEvent.target = createEventTarget(target) }

  return gravityEvent
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
    clickOffsetY: Math.trunc(event.clientY),
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

function createEventTarget(target: HTMLElement): GravityEventTarget {
  const eventTarget: GravityEventTarget = {
    element: target.tagName.toLocaleLowerCase(),
    textContent: isInteractiveElement(target) ? target.textContent ?? '' : undefined,
    attributes: {
      ...getHTMLElementAttributes(target),
    },
  }

  try {
    eventTarget.selector = unique(target)
  } catch {
    // do nothing
  }
  return eventTarget
}
