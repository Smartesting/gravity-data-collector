import EventListenersHandler from '../event-listeners-handler/EventListenersHandler';
export declare const GRAVITY_SESSION_TRACKING_SUSPENDED = "gravity-session-tracking-suspended";
export default class TrackingHandler {
    private readonly errorTerminateTracking;
    private eventListenerHandler;
    private active;
    constructor(errorTerminateTracking: number[]);
    setActive(active: boolean): void;
    activateTracking(): void;
    init(eventListenerHandler: EventListenersHandler): void;
    isTracking(): boolean;
    deactivateTracking(): void;
    private senderErrorCallback;
    getSenderErrorCallback(): (statusCode: number) => void;
}
