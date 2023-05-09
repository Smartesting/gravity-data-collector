import { TargetedUserAction, UserAction } from '../types'

export default function isTargetedUserAction(userAction: UserAction): userAction is TargetedUserAction {
    return (userAction as TargetedUserAction).target !== undefined
}
