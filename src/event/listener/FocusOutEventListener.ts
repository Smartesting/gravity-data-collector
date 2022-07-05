import IEventHandler from "../handler/IEventHandler";
import EventType from "../eventType";
import { createGravityEvent } from "../event";
import EventListener from "./EventListener";
import { anonymizeInputValue, isCheckbox } from "../../utils/dom";

type HTMLInputWithValue = HTMLInputElement | HTMLTextAreaElement;

class FocusOutEventListener extends EventListener {

    constructor(eventHandler: IEventHandler, window: Window) {
        super(eventHandler, EventType.FocusOut, window);
    }

    async listener(event: FocusEvent) {
        const elementTarget = event.target as HTMLInputWithValue;

        if (isCheckbox(elementTarget)) return;

        const gravityEvent = await createGravityEvent(event, this.eventType);
        if (gravityEvent.target) {
            gravityEvent.target.value = anonymizeInputValue(elementTarget);
        }
        this.eventHandler.run(gravityEvent);
    }
}

export default FocusOutEventListener;
