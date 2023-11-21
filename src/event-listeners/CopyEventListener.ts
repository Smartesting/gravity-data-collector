import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import IUserActionHandler from '../user-action/IUserActionHandler'
import { UserActionType } from '../types'

export default class CopyEventListener extends TargetedEventListener {
    constructor(userActionHandler: IUserActionHandler, window: Window, options: TargetEventListenerOptions = {}) {
        super(userActionHandler, UserActionType.Copy, window, options)
    }

    listener(event: Event) {
        const userAction = createTargetedUserAction(event, this.userActionType, this.options)
        if (userAction !== null) {
            this.userActionHandler.handle(userAction)
        }
    }
}
