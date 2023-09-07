import { UserActionType } from '../types';
import { IEventListener } from './IEventListener';
import IUserActionHandler from '../user-action/IUserActionHandler';
export default abstract class EventListener implements IEventListener {
    protected readonly userActionHandler: IUserActionHandler;
    protected readonly userActionType: UserActionType;
    protected readonly window: Window;
    private readonly listenerBind;
    protected constructor(userActionHandler: IUserActionHandler, userActionType: UserActionType, window: Window);
    init(): void;
    terminate(): void;
    protected abstract listener(event: Event): void;
}
