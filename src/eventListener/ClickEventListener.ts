import IEventHandler from "../eventHandler/IEventHandler";
import EventType from "../event/eventType";
import { createGravityEvent } from "../event/event";

class ClickEventListener {
    private eventHandler: IEventHandler;

    constructor(eventHandler: IEventHandler) {
        this.eventHandler = eventHandler;
    }

    init() {
        window.addEventListener("click", async (event) => {
            this.eventHandler.run(await createGravityEvent(event, EventType.Click));
        }, true);
    }
}

export default ClickEventListener;
