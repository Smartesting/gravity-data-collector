import { HTMLInputWithValue } from '../types'

const TAG_NAME_DISALLOWED_BY_KEY_LISTENERS = ['textarea']
const INPUT_ALLOWED_BY_KEY_LISTENERS = ['radio', 'select', 'checkbox', 'button']
const KEYS_ALLOWED_BY_KEY_LISTENERS = ['tab']

export function isKeyAllowedByKeyListeners(keyCode: string): boolean {
  return KEYS_ALLOWED_BY_KEY_LISTENERS.includes(keyCode.toLowerCase())
}

export function isTargetAllowedByKeyListeners(target: EventTarget | null): boolean {
  if (target === null) return true

  const elementTarget = target as HTMLElement
  if (TAG_NAME_DISALLOWED_BY_KEY_LISTENERS.includes(elementTarget.tagName.toLocaleLowerCase())) return false

  if (elementTarget.tagName.toLowerCase() === 'input') {
    const inputElementTarget = target as HTMLInputWithValue
    return INPUT_ALLOWED_BY_KEY_LISTENERS.includes(inputElementTarget.type)
  }
  return true
}
