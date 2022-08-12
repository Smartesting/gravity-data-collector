import { TargetedUserAction, UserActionType } from '../types'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { mockClick, mockKeyDown, mockKeyUp } from '../test-utils/mocks'

export function createClickUserAction(element: HTMLElement, clientX: number = 10, clientY: number = 10): TargetedUserAction {
  return createTargetedUserAction(mockClick(element, clientX, clientY), UserActionType.Click)!
}

export function createKeyUpUserAction(element: HTMLElement, key:string,code:string): TargetedUserAction {
  return createTargetedUserAction(mockKeyUp(element, key, code), UserActionType.KeyUp)!
}

export function createKeyDownUserAction(element: HTMLElement, key:string,code:string): TargetedUserAction {
  return createTargetedUserAction(mockKeyDown(element, key, code), UserActionType.KeyDown)!
}
