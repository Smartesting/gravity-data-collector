import { IEventListener } from '../event-listeners/IEventListener';
export default class EventListenersHandler {
    private readonly eventListeners;
    constructor(eventListeners: IEventListener[]);
    initializeEventListeners(): void;
    terminateEventListeners(): void;
}
