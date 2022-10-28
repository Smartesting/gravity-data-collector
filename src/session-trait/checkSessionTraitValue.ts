import { ALLOWED_SESSION_TRAIT_VALUE_TYPES } from '../types'

export function preventBadSessionTraitValue(value: any): boolean {
  if (!checkSessionTraitValue(value)) {
    console.warn('[Gravity Data Collector] The following session trait value is not allowed: ', value)
    return false
  }
  return true
}

export function checkSessionTraitValue(value: any): boolean {
  if (value === undefined || value === null) return false
  const type = typeof value
  if (!ALLOWED_SESSION_TRAIT_VALUE_TYPES.includes(type)) {
    return false
  }
  return !(type === 'string' && (value as string).length > 255)
}
