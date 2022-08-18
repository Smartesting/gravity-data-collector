import { TargetedUserAction, UserActionType } from '../types'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { mockClick, mockKeyDown, mockKeyUp } from './mocks'
import { AssertionError } from 'assert'

export function createClickUserAction(
  element: HTMLElement,
  clientX: number = 10,
  clientY: number = 10,
  document: Document = global.document,
): TargetedUserAction {
  const userAction = createTargetedUserAction(mockClick(element, clientX, clientY), UserActionType.Click, document)
  if (userAction === null) {
    throw new AssertionError({ message: 'Expected non-null Click User Action' })
  }
  return userAction
}

export function createKeyUpUserAction(
  element: HTMLElement,
  key: string,
  code: string,
  document: Document = global.document,
): TargetedUserAction {
  const userAction = createTargetedUserAction(mockKeyUp(element, key, code), UserActionType.KeyUp, document)
  if (userAction === null) {
    throw new AssertionError({ message: 'Expected non-null KeyUp User Action' })
  }
  return userAction
}

export function createKeyDownUserAction(
  element: HTMLElement,
  key: string,
  code: string,
  document: Document = global.document,
): TargetedUserAction {
  const userAction = createTargetedUserAction(mockKeyDown(element, key, code), UserActionType.KeyDown, document)
  if (userAction === null) {
    throw new AssertionError({ message: 'Expected non-null KeyDown User Action' })
  }
  return userAction
}