import IEventHandler from "./IEventHandler";
import { ConsoleEventHandlerOptions, TEvent } from "../../types";

const DEFAULT_MAX_DELAY = 500

export class ConsoleEventHandler implements IEventHandler {
    constructor(
        private readonly authKey: string,
        private readonly sessionId: string,
        private readonly output: (...data: any[]) => void,
        private readonly options: ConsoleEventHandlerOptions = {}
    ) {}

    run(event: TEvent) {
        const { simulation } = this.options
        if (!simulation) return this.printEvent(event)

        this.printEventWithDelay(event)
    }

    private printEventWithDelay(event: TEvent) {
        let maxDelay = this.options.maxDelay || DEFAULT_MAX_DELAY

        setTimeout(() => {
            this.printEvent(event)
        }, Math.random() * maxDelay)
    }

    private printEvent(event: TEvent) {
        this.output("[GL DEBUG]");
        this.output("Session: ", this.sessionId)
        this.output("authKey: ", this.authKey)
        this.output(event)
    }
}
