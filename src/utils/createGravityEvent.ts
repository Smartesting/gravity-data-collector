// @ts-ignore
import unique from '@cypress/unique-selector';
import EventType from './eventType';
import getLocationData from './getLocationData';
import getViewportData from './getViewportData';

async function createGravityEvent(event: Event, type: EventType) {
  const gravityEvent: GravityEvent = {
    type: type,
    location: getLocationData(),
    recordedAt: Date.now(),
    viewportData: getViewportData(),
  };

  const target = event.target as HTMLElement;

  if (target) {
    if (type === EventType.Click) {
      const targetOffset = target.getBoundingClientRect();
      const pointerEvent = event as PointerEvent;
      gravityEvent.eventData = {
        clickOffsetX: Math.trunc(pointerEvent.clientX),
        clickOffsetY: Math.trunc(pointerEvent.clientY),
        elementOffsetX: Math.trunc(targetOffset.left),
        elementOffsetY: Math.trunc(targetOffset.top),
        elementRelOffsetX: Math.trunc(pointerEvent.clientX - targetOffset.left),
        elementRelOffsetY: Math.trunc(pointerEvent.clientY - targetOffset.top),
      };
    }

    gravityEvent.target = {
      element: target.tagName.toLocaleLowerCase(),
      textContent: target.textContent || '',
      attributes: {
        ...getHTMLElementAttributes(target),
      },
    };

    try {
      gravityEvent.target.selector = unique(target);
    } catch {
      // do nothing
    }
  }

  return gravityEvent;
}

function getHTMLElementAttributes(elt: HTMLElement) {
  const attrList = elt.getAttributeNames();

  return attrList.reduce<Record<string, string>>((acc, attr) => {
    acc[attr] = elt.getAttribute(attr) || '';
    return acc;
  }, {});
}

export default createGravityEvent;
