import { v4 as uuidv4 } from "uuid";
import IEventHandler from "../handler/IEventHandler";
import EventType from "../eventType";
import { DataAnonymizer } from "../../anonymizer/dataAnonymizer";
import { createGravityEvent } from "../event";
import EventListener from "./EventListener";

const anonymizer = new DataAnonymizer(uuidv4());

type HTMLInputWithValue = HTMLInputElement | HTMLTextAreaElement;

class FocusOutEventListener extends EventListener {

    constructor(eventHandler: IEventHandler, window: Window) {
        super(eventHandler, EventType.FocusOut, window);
    }

    async listener(event: FocusEvent) {
        const elementTarget = event.target as HTMLInputWithValue;

        if (elementTarget instanceof HTMLInputElement || elementTarget instanceof HTMLTextAreaElement) {

            if (FocusOutEventListener.isExcluded(elementTarget)) return;

            const gravityEvent = await createGravityEvent(event, this.eventType);
            if (gravityEvent.target) {
                gravityEvent.target.value = FocusOutEventListener.inputValueType(elementTarget);
            }
            this.eventHandler.run(gravityEvent);
        }
    }

    private static isExcluded(element: HTMLInputWithValue): boolean {
        switch (element.type) {
            case "checkbox":
                return true;
            default:
                return false;
        }
    }

    private static inputValueType(element: HTMLInputWithValue) {
        switch (element.type) {
            case "checkbox":
                return (!!element.getAttribute("checked")).toString();
            case "email":
                return anonymizer.anonymize(element.value);
            case "file":
                return anonymizer.anonymize(element.value);
            case "password":
                return "[[PASSWORD]]";
            case "search":
                return element.value;
            case "text":
                return anonymizer.anonymize(element.value);
            case "tel":
                return anonymizer.anonymize(element.value);
            case "url":
                return anonymizer.anonymize(element.value);
            default:
                return anonymizer.anonymize(element.value);
        }
    }
}

export default FocusOutEventListener;
