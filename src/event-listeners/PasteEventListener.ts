import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'
import IUserActionHandler from '../user-action/IUserActionHandler'
import { UserActionType } from '../types'

export default class PasteEventListener extends TargetedEventListener {
    constructor(userActionHandler: IUserActionHandler, window: Window, options: TargetEventListenerOptions = {}) {
        super(userActionHandler, UserActionType.Paste, window, options)
    }
}
