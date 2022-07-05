import { v4 as uuidv4 } from "uuid";
import IEventHandler from "../event/handler/IEventHandler";
import { ConsoleEventHandler } from "../event/handler/ConsoleEventHandler";
import ClickEventListener from "../event/listener/ClickEventListener";
import FocusOutEventListener from "../event/listener/FocusOutEventListener";
import { createSessionEvent } from "../event/event";
import { CollectorOptions } from "../types";

class CollectorWrapper {
    eventHandler: IEventHandler;

    constructor(
        authKey: string,
        private readonly window: Window = global.window,
        private readonly options: CollectorOptions = {}) {

        const sessionId = uuidv4();

        this.eventHandler = new ConsoleEventHandler(authKey, sessionId, { ...options });

        this.initSession();
        this.initializeEventHandlers();
    }

    private initSession() {
        const event = createSessionEvent();
        return this.eventHandler.run(event);
    }

    private initializeEventHandlers() {
        new ClickEventListener(this.eventHandler, this.window).init();
        new FocusOutEventListener(this.eventHandler, this.window).init();
    }
}

export default CollectorWrapper;
