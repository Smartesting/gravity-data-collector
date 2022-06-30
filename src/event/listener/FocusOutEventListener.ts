import { v4 as uuidv4 } from "uuid";
import IEventHandler from "../handler/IEventHandler";
import EventType from "../eventType";
import { DataAnonymizer } from "../../anonymizer/dataAnonymizer";
import { createGravityEvent } from "../event";

const anonymizer = new DataAnonymizer(uuidv4());

type HTMLInputWithValue = HTMLInputElement | HTMLTextAreaElement;

class FocusOutEventListener {
    private eventHandler: IEventHandler;

    constructor(eventHandler: IEventHandler) {
        this.eventHandler = eventHandler;
    }

    init() {
        window.addEventListener(
            "focusout",
            async (event) => {
                const elementTarget = event.target as HTMLInputWithValue;

                if (elementTarget instanceof HTMLInputElement || elementTarget instanceof HTMLTextAreaElement) {
                    const gravityEvent = await createGravityEvent(event, EventType.FocusOut);
                    if (gravityEvent.target) {
                        gravityEvent.target.value = inputValueType(elementTarget);
                    }
                    this.eventHandler.run(gravityEvent);
                }
            },
            true
        );
    }
}

function inputValueType(element: HTMLInputWithValue) {
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

export default FocusOutEventListener;
