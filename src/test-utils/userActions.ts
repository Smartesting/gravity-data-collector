import { NO_ANONYMIZATION_SETTINGS, TargetedUserAction, UserActionType } from '../types'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { mockClick, mockKeyDown, mockKeyUp } from './mocks'
import { AssertionError } from 'assert'

export function createClickUserAction(
  element: HTMLElement,
  clientX: number = 10,
  clientY: number = 10,
  windowInstance: Window = window,
): TargetedUserAction {
  const userAction = createTargetedUserAction(
    windowInstance,
    mockClick(element, clientX, clientY),
    UserActionType.Click,
    NO_ANONYMIZATION_SETTINGS,
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
  windowInstance: Window = window,
): TargetedUserAction {
  const userAction = createTargetedUserAction(
    windowInstance,
    mockKeyUp(element, key, code),
    UserActionType.KeyUp,
    NO_ANONYMIZATION_SETTINGS,
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
  windowInstance: Window = window,
): TargetedUserAction {
  const userAction = createTargetedUserAction(
    windowInstance,
    mockKeyDown(element, key, code),
    UserActionType.KeyDown,
    NO_ANONYMIZATION_SETTINGS,
  )
  if (userAction === null) {
    throw new AssertionError({ message: 'Expected non-null KeyDown User Action' })
  }
  return userAction
}

export function createHashChangeUserAction(windowInstance: Window): TargetedUserAction {
  const hashChangeEvent = {
    type: 'hashchange',
    target: windowInstance,
    newURL: '/plic#ploc',
    oldURL: '/plic',
  } as unknown as HashChangeEvent

  const userAction = createTargetedUserAction(windowInstance, hashChangeEvent, UserActionType.HashChange, {
    anonymizeSelectors: undefined,
    ignoreSelectors: undefined,
  })
  if (userAction === null) {
    throw new AssertionError({ message: 'Expected non-null HashChange User Action' })
  }
  return userAction
}
