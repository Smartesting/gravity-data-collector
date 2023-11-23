import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'
import IUserActionHandler from '../user-action/IUserActionHandler'
import { UserActionType } from '../types'

export default class PauseEventListener extends TargetedEventListener {
    constructor(userActionHandler: IUserActionHandler, window: Window, options: TargetEventListenerOptions = {}) {
        super(userActionHandler, UserActionType.Drop, window, options)
    }
}
