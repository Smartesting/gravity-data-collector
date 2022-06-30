import IEventHandler from "./IEventHandler";
import { TEvent } from "../../types";

export class ConsoleEventHandler implements IEventHandler {
    private readonly authKey: string;
    private readonly sessionId: string;

    constructor(authKey: string, sessionId: string) {
        this.authKey = authKey;
        this.sessionId = sessionId;
    }

    run(event: TEvent) {
        console.debug("[GL DEBUG]");
        console.debug("Session: ", this.sessionId);
        console.debug("authKey: ", this.authKey);
        console.debug(event);
    }
}
