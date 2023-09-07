import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener';
import IUserActionHandler from '../user-action/IUserActionHandler';
declare class ClickEventListener extends TargetedEventListener {
    constructor(userActionHandler: IUserActionHandler, window: Window, options?: TargetEventListenerOptions);
    listener(event: MouseEvent): void;
}
export default ClickEventListener;
