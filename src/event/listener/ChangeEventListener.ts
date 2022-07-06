import IEventHandler from "../handler/IEventHandler";
import EventType from "../eventType";
import { createGravityEvent } from "../event";
import EventListener from "./EventListener";
import { HTMLInputWithValue } from "../../types";
import { anonymizeInputValue } from "../../utils/dom";

class ChangeEventListener extends EventListener {

    constructor(eventHandler: IEventHandler, window: Window) {
        super(eventHandler, EventType.Change, window);
    }

    async listener(event: FocusEvent) {
        const elementTarget = event.target as HTMLInputWithValue;

        const gravityEvent = await createGravityEvent(event, this.eventType);
        if (gravityEvent.target) {
            gravityEvent.target.value = anonymizeInputValue(elementTarget);
        }
        this.eventHandler.run(gravityEvent);
    }
}

export default ChangeEventListener;
