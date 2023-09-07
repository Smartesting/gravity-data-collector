import { TargetedUserAction } from '../types';
import UserActionsHistory from '../user-actions-history/UserActionsHistory';
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener';
import IUserActionHandler from '../user-action/IUserActionHandler';
declare class KeyDownEventListener extends TargetedEventListener {
    private readonly userActionHistory;
    constructor(userActionHandler: IUserActionHandler, window: Window, userActionHistory: UserActionsHistory, options?: TargetEventListenerOptions);
    listener(event: KeyboardEvent): void;
    changeActionIsSame(changeUserAction: TargetedUserAction): boolean;
    actionIsTheSameThanLast(userAction: TargetedUserAction): boolean;
}
export default KeyDownEventListener;
