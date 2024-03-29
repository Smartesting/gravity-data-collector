import { NO_ANONYMIZATION_SETTINGS, TargetedUserAction, UserActionType } from '../types'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { mockClick, mockKeyDown, mockKeyUp } from './mocks'
import { AssertionError } from 'assert'
import getDocument from '../utils/getDocument'

export function createClickUserAction(
  element: HTMLElement,
  clientX: number = 10,
  clientY: number = 10,
  document: Document = getDocument(),
): TargetedUserAction {
  const userAction = createTargetedUserAction(
    mockClick(element, clientX, clientY),
    UserActionType.Click,
    NO_ANONYMIZATION_SETTINGS,
    { document },
  )
  if (userAction === null) {
    throw new AssertionError({ message: 'Expected non-null Click User Action' })
  }
  return userAction
}

export function createKeyUpUserAction(
  element: HTMLElement,
  key: string,
  code: string,
  document: Document = getDocument(),
): TargetedUserAction {
  const userAction = createTargetedUserAction(
    mockKeyUp(element, key, code),
    UserActionType.KeyUp,
    NO_ANONYMIZATION_SETTINGS,
    { document },
  )
  if (userAction === null) {
    throw new AssertionError({ message: 'Expected non-null KeyUp User Action' })
  }
  return userAction
}

export function createKeyDownUserAction(
  element: HTMLElement,
  key: string,
  code: string,
  document: Document = getDocument(),
): TargetedUserAction {
  const userAction = createTargetedUserAction(
    mockKeyDown(element, key, code),
    UserActionType.KeyDown,
    NO_ANONYMIZATION_SETTINGS,
    { document },
  )
  if (userAction === null) {
    throw new AssertionError({ message: 'Expected non-null KeyDown User Action' })
  }
  return userAction
}

export function createHashChangeUserAction(window: Window): TargetedUserAction {
  const hashChangeEvent = {
    type: 'hashchange',
    target: window,
    newURL: '/plic#ploc',
    oldURL: '/plic',
  } as unknown as HashChangeEvent

  const userAction = createTargetedUserAction(
    hashChangeEvent,
    UserActionType.HashChange,
    { anonymizeSelectors: undefined, ignoreSelectors: undefined },
    {
      document,
    },
  )
  if (userAction === null) {
    throw new AssertionError({ message: 'Expected non-null HashChange User Action' })
  }
  return userAction
}
