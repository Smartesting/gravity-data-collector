import { HTMLInputWithValue } from '../types'

const TAG_NAME_DISALLOWED_BY_KEY_LISTENERS: string[] = ['textarea']
const INPUT_ALLOWED_BY_KEY_LISTENERS = ['radio', 'select', 'checkbox', 'button', 'textarea']
const KEYS_ALLOWED_BY_KEY_LISTENERS = ['tab', 'enter', 'numpadenter']

export function isKeyAllowedByKeyListeners(keyCode: string): boolean {
  return keyCode !== undefined && KEYS_ALLOWED_BY_KEY_LISTENERS.includes(keyCode.toLowerCase())
}

export function isTargetAllowedByKeyListeners(target: EventTarget | null): boolean {
  if (target === null) return true

  const elementTarget = target as HTMLElement
  if (TAG_NAME_DISALLOWED_BY_KEY_LISTENERS.includes(elementTarget.tagName.toLowerCase())) return false

  if (elementTarget.tagName.toLowerCase() === 'input' || elementTarget.tagName.toLowerCase() === 'textarea') {
    const inputElementTarget = target as HTMLInputWithValue
    return INPUT_ALLOWED_BY_KEY_LISTENERS.includes(inputElementTarget.type)
  }
  return true
}
