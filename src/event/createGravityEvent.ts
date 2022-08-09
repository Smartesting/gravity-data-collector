import viewport from '../utils/viewport'
import location from '../utils/location'
import unique from '@cypress/unique-selector'
import { getHTMLElementAttributes, isInteractiveElement } from '../utils/dom'
import {
  EventType,
  GravityClickEventData,
  GravityEvent,
  GravityEventData,
  GravityEventTarget,
  GravityKeyEventData,
} from '../types'
import gravityDocument from '../utils/gravityDocument'

export function createGravityEvent(event: Event, type: EventType): GravityEvent {
  const gravityEvent: GravityEvent = {
    type,
    location: location(),
    document: gravityDocument(),
    recordedAt: new Date().toISOString(),
    viewportData: viewport(),
  }

  const eventData = createEventData(event, type)
  if (eventData !== null) {
    gravityEvent.eventData = eventData
  }

  const target = event.target as HTMLElement
  if (target !== null) {
    gravityEvent.target = createEventTarget(target)
  }

  return gravityEvent
}

function createEventData(event: Event, type: EventType): GravityEventData | null {
  switch (type) {
    case EventType.Click:
      return createMouseEventData(event as MouseEvent)
    case EventType.KeyDown:
    case EventType.KeyUp:
      return createKeyboardEventData(event as KeyboardEvent)
    default:
      return null
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

function createKeyboardEventData(event: KeyboardEvent): GravityKeyEventData {
  const { key, code } = event

  return {
    key,
    code,
  }
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
