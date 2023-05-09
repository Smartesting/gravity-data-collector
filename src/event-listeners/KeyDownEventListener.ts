import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { KeyUserActionData, TargetedUserAction, UserActionType } from '../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners } from '../utils/listeners'
import UserActionHandler from '../user-action/UserActionHandler'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'
import isTargetedUserAction from '../utils/isTargetedUserAction'

class KeyDownEventListener extends TargetedEventListener {
    constructor (
        userActionHandler: UserActionHandler,
        window: Window,
        private readonly userActionHistory: UserActionsHistory,
        options: TargetEventListenerOptions = {},
    ) {
        super(userActionHandler, UserActionType.KeyDown, window, options)
    }

    listener (event: KeyboardEvent) {
        const userAction = createTargetedUserAction(
            event,
            this.userActionType,
            this.options.excludeRegex,
            this.options.customSelector,
        )
        if (userAction === null || this.actionIsTheSameThanLast(userAction)) return

        if (isKeyAllowedByKeyListeners(event.code)) {
            return this.userActionHandler.handle(userAction)
        }

        if (isTargetAllowedByKeyListeners(event.target)) {
            this.userActionHandler.handle(userAction)
        }
    }

    actionIsTheSameThanLast (userAction: TargetedUserAction): boolean {
        const lastUserAction = this.userActionHistory.getLast()
        if (lastUserAction === undefined) return false
        if (isTargetedUserAction(lastUserAction) && lastUserAction.type !== UserActionType.KeyDown) return false

        const targetedUserAction = lastUserAction as TargetedUserAction

        if (targetedUserAction.target.element !== userAction.target.element) return false
        if (targetedUserAction.target.selector !== userAction.target.selector) return false

        if (
            (targetedUserAction.userActionData as KeyUserActionData).key !==
            (userAction.userActionData as KeyUserActionData).key
        ) {
            return false
        }

        return (
            (targetedUserAction.userActionData as KeyUserActionData).code ===
            (userAction.userActionData as KeyUserActionData).code
        )
    }
}

export default KeyDownEventListener
