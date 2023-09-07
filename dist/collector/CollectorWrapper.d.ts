import { CollectorOptions, SessionTraitValue } from '../types';
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler';
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory';
import TestNameHandler from '../test-name-handler/TestNameHandler';
import SessionTraitHandler from '../session-trait/SessionTraitHandler';
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler';
import TrackingHandler from '../tracking-handler/TrackingHandler';
import IUserActionHandler from '../user-action/IUserActionHandler';
declare class CollectorWrapper {
    readonly options: CollectorOptions;
    private readonly window;
    readonly sessionIdHandler: ISessionIdHandler;
    readonly testNameHandler: TestNameHandler;
    readonly userActionHandler: IUserActionHandler;
    readonly userActionsHistory: MemoryUserActionsHistory;
    readonly sessionTraitHandler: SessionTraitHandler;
    readonly eventListenerHandler: EventListenersHandler;
    readonly trackingHandler: TrackingHandler;
    constructor(options: CollectorOptions, window: Window, sessionIdHandler: ISessionIdHandler, testNameHandler: TestNameHandler);
    identifySession(traitName: string, traitValue: SessionTraitValue): void;
    private initSession;
}
export default CollectorWrapper;
