import { UserAction, UserActionType } from '../types'
import isTargetedUserAction from './isTargetedUserAction'

export default function isIgnoredAction(userAction: UserAction): boolean {
  return (
    isTargetedUserAction(userAction) &&
    userAction.type === UserActionType.Click &&
    (userAction.target.element === 'select' ||
      (userAction.target.element === 'input' && ['checkbox', 'radio'].includes(userAction.target.type ?? '')))
  )
}
