import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener';
import IUserActionHandler from '../user-action/IUserActionHandler';
declare class KeyUpEventListener extends TargetedEventListener {
    constructor(userActionHandler: IUserActionHandler, window: Window, options?: TargetEventListenerOptions);
    listener(event: KeyboardEvent): void;
}
export default KeyUpEventListener;
