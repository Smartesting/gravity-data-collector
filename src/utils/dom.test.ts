import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import { isInteractiveElement } from './dom'

describe('isInteractiveElement', () => {
  it('detects button as an interactive element', () => {
    const dom = new JSDOM('<button/>')
    const buttonElement = dom.window.document.querySelector('button')

    expect(isInteractiveElement(buttonElement as unknown as HTMLElement)).toBeTruthy()
  })

  it('detects link as an interactive element', () => {
    const dom = new JSDOM('<a/>')
    const linkElement = dom.window.document.querySelector('a')

    expect(isInteractiveElement(linkElement as unknown as HTMLElement)).toBeTruthy()
  })

  it('detects input as an interactive element', () => {
    const dom = new JSDOM('<input/>')
    const inputElement = dom.window.document.querySelector('input')

    expect(isInteractiveElement(inputElement as unknown as HTMLElement)).toBeTruthy()
  })

  it('detects select as an interactive element', () => {
    const dom = new JSDOM('<select/>')
    const selectElement = dom.window.document.querySelector('select')

    expect(isInteractiveElement(selectElement as unknown as HTMLElement)).toBeTruthy()
  })

  it('does not detect body as an interactive element', () => {
    const dom = new JSDOM('<body/>')
    const bodyElement = dom.window.document.querySelector('body')

    expect(isInteractiveElement(bodyElement as unknown as HTMLElement)).toBeFalsy()
  })

  it('does not detect html as an interactive element', () => {
    const dom = new JSDOM('<html lang="en"/>')
    const htmlElement = dom.window.document.querySelector('html')

    expect(isInteractiveElement(htmlElement as unknown as HTMLElement)).toBeFalsy()
  })

  it('does not detect div as an interactive element', () => {
    const dom = new JSDOM('<div/>')
    const divElement = dom.window.document.querySelector('div')

    expect(isInteractiveElement(divElement as unknown as HTMLElement)).toBeFalsy()
  })

  it('does not detect list as an interactive element', () => {
    const dom = new JSDOM('<li/>')
    const listElement = dom.window.document.querySelector('li')

    expect(isInteractiveElement(listElement as unknown as HTMLElement)).toBeFalsy()
  })

  it('does not detect list item as an interactive element', () => {
    const dom = new JSDOM('<ul/>')
    const listItemElement = dom.window.document.querySelector('ul')

    expect(isInteractiveElement(listItemElement as unknown as HTMLElement)).toBeFalsy()
  })

  it('does not detect fieldSet item as an interactive element', () => {
    const dom = new JSDOM('<fieldSet/>')
    const fieldSetItemElement = dom.window.document.querySelector('fieldSet')
    expect(isInteractiveElement(fieldSetItemElement as unknown as HTMLElement)).toBeFalsy()
  })
})
