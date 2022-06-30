import { v4 as uuidv4 } from "uuid";
import IEventHandler from "../eventHandler/IEventHandler";
import GravityEventHandler from "../eventHandler/GravityEventHandler";
import { ConsoleEventHandler } from "../eventHandler/ConsoleEventHandler";
import ClickEventListener from "../eventListener/ClickEventListener";
import FocusOutEventListener from "../eventListener/FocusOutEventListener";
import { createSessionEvent } from "../event/event";
import { TCollectorOptions } from "../types";

class CollectorWrapper {
    options?: TCollectorOptions;
    eventHandler: IEventHandler;

    constructor(authKey: string, options?: TCollectorOptions) {
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
