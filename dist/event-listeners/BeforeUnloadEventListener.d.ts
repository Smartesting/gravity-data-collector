import EventListener from '../event-listeners/EventListener';
import IUserActionHandler from '../user-action/IUserActionHandler';
declare class BeforeUnloadEventListener extends EventListener {
    constructor(userActionHandler: IUserActionHandler, window: Window);
    listener(event: Event): Promise<void>;
}
export default BeforeUnloadEventListener;
