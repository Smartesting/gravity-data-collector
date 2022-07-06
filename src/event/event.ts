import unique from "@cypress/unique-selector";
import viewport from "../utils/viewport";
import location from "../utils/location";
import { getHTMLElementAttributes } from "../utils/dom";
import { GravityEvent, GravitySessionStartedEvent, EventType } from "../types";
import pJson from "./../../package.json";

export async function createGravityEvent(event: Event, type: EventType): Promise<GravityEvent> {
    const gravityEvent: GravityEvent = {
        type: type,
        location: location(),
        recordedAt: Date.now(),
        viewportData: viewport()
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
                elementRelOffsetY: Math.trunc(pointerEvent.clientY - targetOffset.top)
            };
        }

        gravityEvent.target = {
            element: target.tagName.toLocaleLowerCase(),
            textContent: target.textContent || "",
            attributes: {
                ...getHTMLElementAttributes(target)
            }
        };

        try {
            gravityEvent.target.selector = unique(target);
        } catch {
            // do nothing
        }
    }
    return gravityEvent;
}

export function createSessionEvent(): GravitySessionStartedEvent {
    const initSessionEvent: GravitySessionStartedEvent = {
        type: EventType.SessionStarted,
        recordedAt: Date.now(),
        location: location(),
        viewportData: viewport(),
        version: pJson.version
    };

    if ((<any>window).Cypress && (<any>window).Cypress.currentTest) {
        initSessionEvent.test = (<any>window).Cypress.currentTest.titlePath.join(" > ");
    }

    return initSessionEvent;
}
