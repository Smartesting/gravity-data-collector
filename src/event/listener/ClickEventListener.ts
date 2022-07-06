import IEventHandler from "../handler/IEventHandler";
import { createGravityEvent } from "../event";
import EventListener from "./EventListener";
import { EventType } from "../../types";

class ClickEventListener extends EventListener {

    constructor(eventHandler: IEventHandler, window: Window) {
        super(eventHandler, EventType.Click, window);
    }

    async listener(event: MouseEvent) {
        this.eventHandler.run(await createGravityEvent(event, this.eventType));
    }
}

export default ClickEventListener;
