import IEventHandler from "../handler/IEventHandler";
import EventType from "../eventType";
import { createGravityEvent } from "../event";
import EventListener from "./EventListener";

class ClickEventListener extends EventListener {

    constructor(eventHandler: IEventHandler, window: Window) {
        super(eventHandler, EventType.Click, window);
    }

    async listener(event: MouseEvent) {
        this.eventHandler.run(await createGravityEvent(event, this.eventType, this.window));
    }
}

export default ClickEventListener;
