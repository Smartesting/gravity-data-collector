import { describe, expect, it } from 'vitest'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { isCheckableElement } from './dom'

describe('isCheckableElement', () => {
  it('detects checkbox as a checkable element', () => {
    const { element } = createElementInJSDOM('<input type="checkbox"/>', 'input')
    expect(isCheckableElement(element)).toBeTruthy()
  })

  it('detects radio as a checkable element', () => {
    const { element } = createElementInJSDOM('<input type="radio"/>', 'input')
    expect(isCheckableElement(element)).toBeTruthy()
  })

  it('does not detect button as a checkable element', () => {
    const { element } = createElementInJSDOM('<button/>', 'button')
    expect(isCheckableElement(element)).toBeFalsy()
  })

  it('does not detect link as a checkable element', () => {
    const { element } = createElementInJSDOM('<a/>', 'a')
    expect(isCheckableElement(element)).toBeFalsy()
  })

  it('does not detect simple input as a checkable element', () => {
    const { element } = createElementInJSDOM('<input/>', 'input')
    expect(isCheckableElement(element)).toBeFalsy()
  })

  it('does not detect select as a checkable element', () => {
    const { element } = createElementInJSDOM('<select/>', 'select')
    expect(isCheckableElement(element)).toBeFalsy()
  })

  it('does not detect body as a checkable element', () => {
    const { element } = createElementInJSDOM('<body/>', 'body')
    expect(isCheckableElement(element)).toBeFalsy()
  })

  it('does not detect html as a checkable element', () => {
    const { element } = createElementInJSDOM('<html lang="en"/>', 'html')
    expect(isCheckableElement(element)).toBeFalsy()
  })

  it('does not detect div as a checkable element', () => {
    const { element } = createElementInJSDOM('<div/>', 'div')
    expect(isCheckableElement(element)).toBeFalsy()
  })

  it('does not detect list as a checkable element', () => {
    const { element } = createElementInJSDOM('<li/>', 'li')
    expect(isCheckableElement(element)).toBeFalsy()
  })

  it('does not detect list item as a checkable element', () => {
    const { element } = createElementInJSDOM('<ul/>', 'ul')
    expect(isCheckableElement(element)).toBeFalsy()
  })

  it('does not detect fieldSet item as a checkable element', () => {
    const { element } = createElementInJSDOM('<fieldset/>', 'fieldset')
    expect(isCheckableElement(element)).toBeFalsy()
  })
})
