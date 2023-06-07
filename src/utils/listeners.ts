import { HTMLInputWithValue } from '../types'

const TAG_NAME_DISALLOWED_BY_KEY_LISTENERS: string[] = ['textarea']
const INPUT_ALLOWED_BY_KEY_LISTENERS = ['radio', 'select', 'checkbox', 'button']
const KEYS_ALLOWED_BY_KEY_LISTENERS = ['tab', 'enter', 'numpadenter']
const NON_TEXT_KEYS = ['tab', 'enter', 'numpadenter', 'esc']

export function recordChangeEvent(keyCode: string, target: EventTarget | null): boolean {
  if (target === null) return false

  const inputElementTarget = target as HTMLInputWithValue
  if (INPUT_ALLOWED_BY_KEY_LISTENERS.includes(inputElementTarget.type)) return false

  const elementTarget = target as HTMLElement
  const isTextInput = (elementTarget.tagName.toLowerCase() === 'input' || elementTarget.tagName.toLowerCase() === 'textarea')

  return isTextInput && !NON_TEXT_KEYS.includes(keyCode.toLowerCase())
}

export function isKeyAllowedByKeyListeners(keyCode: string): boolean {
  return keyCode !== undefined && KEYS_ALLOWED_BY_KEY_LISTENERS.includes(keyCode.toLowerCase())
}

export function isTargetAllowedByKeyListeners(target: EventTarget | null): boolean {
  if (target === null) return true

  const elementTarget = target as HTMLElement
  const inputElementTarget = target as HTMLInputWithValue

  if (TAG_NAME_DISALLOWED_BY_KEY_LISTENERS.includes(elementTarget.tagName.toLowerCase())) return false

  if (elementTarget.tagName.toLowerCase() === 'input') {
    return INPUT_ALLOWED_BY_KEY_LISTENERS.includes(inputElementTarget.type)
  }

  return true
}
