import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener';
import IUserActionHandler from '../user-action/IUserActionHandler';
declare class ChangeEventListener extends TargetedEventListener {
    constructor(userActionHandler: IUserActionHandler, window: Window, options?: TargetEventListenerOptions);
    listener(event: InputEvent): void;
}
export default ChangeEventListener;
