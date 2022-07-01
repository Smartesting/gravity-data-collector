import IEventHandler from "./IEventHandler";
import { ConsoleEventHandlerOptions, TEvent } from "../../types";

export class ConsoleEventHandler implements IEventHandler {
    readonly DEFAULT_MAX_DELAY = 500;

    private readonly authKey: string;
    private readonly sessionId: string;
    private readonly options: ConsoleEventHandlerOptions;

    constructor(authKey: string, sessionId: string, options: ConsoleEventHandlerOptions = {}) {
        this.authKey = authKey;
        this.sessionId = sessionId;
        this.options = options;
    }

    run(event: TEvent) {

        const { simulation } = this.options;

        if (!simulation) return this.printEvent(event);

        this.printEventWithDelay(event);
    }

    private printEventWithDelay(event: TEvent) {

        let { maxDelay } = this.options;
        if (maxDelay === undefined) maxDelay = this.DEFAULT_MAX_DELAY;

        setTimeout(() => {
            this.printEvent(event);
        }, Math.random() * maxDelay);
    }

    private printEvent(event: TEvent) {
        console.debug("[GL DEBUG]");
        console.debug("Session: ", this.sessionId);
        console.debug("authKey: ", this.authKey);
        console.debug(event);
    }
}
