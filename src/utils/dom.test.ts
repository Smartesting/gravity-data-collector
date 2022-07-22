import { describe, expect, it } from 'vitest'
import { isInteractiveElement } from './dom'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'

describe('isInteractiveElement', () => {
  it('detects button as an interactive element', () => {
    const { element } = createElementInJSDOM('<button/>', 'button')

    expect(isInteractiveElement(element)).toBeTruthy()
  })

  it('detects link as an interactive element', () => {
    const { element } = createElementInJSDOM('<a/>', 'a')

    expect(isInteractiveElement(element)).toBeTruthy()
  })

  it('detects input as an interactive element', () => {
    const { element } = createElementInJSDOM('<input/>', 'input')

    expect(isInteractiveElement(element)).toBeTruthy()
  })

  it('detects select as an interactive element', () => {
    const { element } = createElementInJSDOM('<select/>', 'select')

    expect(isInteractiveElement(element)).toBeTruthy()
  })

  it('does not detect body as an interactive element', () => {
    const { element } = createElementInJSDOM('<body/>', 'body')

    expect(isInteractiveElement(element)).toBeFalsy()
  })

  it('does not detect html as an interactive element', () => {
    const { element } = createElementInJSDOM('<html lang="en"/>', 'html')

    expect(isInteractiveElement(element)).toBeFalsy()
  })

  it('does not detect div as an interactive element', () => {
    const { element } = createElementInJSDOM('<div/>', 'div')

    expect(isInteractiveElement(element)).toBeFalsy()
  })

  it('does not detect list as an interactive element', () => {
    const { element } = createElementInJSDOM('<li/>', 'li')

    expect(isInteractiveElement(element)).toBeFalsy()
  })

  it('does not detect list item as an interactive element', () => {
    const { element } = createElementInJSDOM('<ul/>', 'ul')

    expect(isInteractiveElement(element)).toBeFalsy()
  })

  it('does not detect fieldSet item as an interactive element', () => {
    const { element } = createElementInJSDOM('<fieldSet/>', 'fieldSet')
    expect(isInteractiveElement(element)).toBeFalsy()
  })
})
