import { v4 as uuidv4 } from "uuid";
import IEventHandler from "../event/handler/IEventHandler";
import GravityEventHandler from "../event/handler/GravityEventHandler";
import { ConsoleEventHandler } from "../event/handler/ConsoleEventHandler";
import ClickEventListener from "../event/listener/ClickEventListener";
import FocusOutEventListener from "../event/listener/FocusOutEventListener";
import { createSessionEvent } from "../event/event";
import { CollectorOptions } from "../types";

class CollectorWrapper {
    options?: CollectorOptions;
    eventHandler: IEventHandler;

    constructor(authKey: string, options?: CollectorOptions) {
        this.options = options;

        const sessionId = uuidv4();

        if (this.options && this.options.debug) {
            this.eventHandler = new ConsoleEventHandler(authKey, sessionId);
        } else {
            this.eventHandler = new GravityEventHandler(authKey, sessionId, (options && options.baseUrl) || null, (options && options.authorizeBatch) || false);
        }

        this.initSession();
        this.initializeEventHandlers();
    }

    private initSession() {
        const event = createSessionEvent();
        return this.eventHandler.run(event);
    }

    private initializeEventHandlers() {
        new ClickEventListener(this.eventHandler).init();
        new FocusOutEventListener(this.eventHandler).init();
    }
}

export default CollectorWrapper;
