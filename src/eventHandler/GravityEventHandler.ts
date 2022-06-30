import IEventHandler from "./IEventHandler";
import { TEvent } from "../types";

export default class GravityEventHandler implements IEventHandler {
    readonly DEFAULT_SERVER_BASE_URL = "https://gravity.smartesting.com";
    readonly EVENT_BATCH_LIMIT = 10;

    serverUrl: string;
    private readonly authKey: string;
    private readonly sessionId: string;
    private readonly allowBatch: boolean;

    private eventQueue: TEvent[];
    private isRequestIdleCallbackScheduled: boolean;

    constructor(authKey: string, sessionId: string, baseServerUrl?: string | null, batch?: boolean | null) {
        this.serverUrl = `${baseServerUrl || this.DEFAULT_SERVER_BASE_URL}/gravitylogger/savelog`;
        this.authKey = authKey;
        this.sessionId = sessionId;
        this.allowBatch = batch || false;
        this.eventQueue = [];
        this.isRequestIdleCallbackScheduled = false;
    }

    run(event: TEvent) {
        this.eventQueue.push(event);
        this.schedulePendingEvents();
    }

    private schedulePendingEvents() {
        if (this.isRequestIdleCallbackScheduled)
            return;

        this.isRequestIdleCallbackScheduled = true;

        if ("requestIdleCallback" in window) {
            requestIdleCallback(this.pushEventToServer.bind(this));
        } else {
            this.pushEventToServer();
        }
    }

    // requestIdCallback for sending analytics data
    // https://developer.chrome.com/blog/using-requestidlecallback/#using-requestidlecallback-for-sending-analytics-data
    private pushEventToServer(deadline?: { timeRemaining: any } | undefined) {
        this.isRequestIdleCallbackScheduled = false;

        if (typeof deadline === "undefined")
            deadline = {
                timeRemaining: function() {
                    return Number.MAX_VALUE;
                }
            };

        while (deadline.timeRemaining() > 0 && this.eventQueue.length > 0) {
            let eventBatch = null;

            if (this.allowBatch) {
                eventBatch = [];
                while (eventBatch.length < this.EVENT_BATCH_LIMIT && this.eventQueue.length > 0) {
                    if (this.eventQueue.length > 0)
                        eventBatch.push(this.eventQueue.shift());
                }
            } else {
                eventBatch = this.eventQueue.shift();
            }

            fetch(this.serverUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-gravity-auth-key": this.authKey,
                    "x-gravity-session": this.sessionId
                },
                body: JSON.stringify(eventBatch)
            });
        }

        if (this.eventQueue.length > 0)
            this.schedulePendingEvents();
    }
}
