import IEventHandler from "../handler/IEventHandler";
import { createGravityEvent } from "../event";
import { EventType } from "../../types";

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
