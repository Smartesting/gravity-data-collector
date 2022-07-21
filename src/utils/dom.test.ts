import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import { isInteractiveElement } from './dom'

describe('isInteractiveElement', () => {
  it('detects button as an interactive element', () => {
    const dom = new JSDOM('<button/>')
    const buttonElement = dom.window.document.querySelector('button')!

    expect(isInteractiveElement(buttonElement)).toBeTruthy()
  })

  it('detects link as an interactive element', () => {
    const dom = new JSDOM('<a/>')
    const linkElement = dom.window.document.querySelector('a')!

    expect(isInteractiveElement(linkElement)).toBeTruthy()
  })

  it('detects input as an interactive element', () => {
    const dom = new JSDOM('<input/>')
    const inputElement = dom.window.document.querySelector('input')!

    expect(isInteractiveElement(inputElement)).toBeTruthy()
  })

  it('detects select as an interactive element', () => {
    const dom = new JSDOM('<select/>')
    const selectElement = dom.window.document.querySelector('select')!

    expect(isInteractiveElement(selectElement)).toBeTruthy()
  })

  it('does not detect body as an interactive element', () => {
    const dom = new JSDOM('<body/>')
    const bodyElement = dom.window.document.querySelector('body')!

    expect(isInteractiveElement(bodyElement)).toBeFalsy()
  })

  it('does not detect html as an interactive element', () => {
    const dom = new JSDOM('<html lang="en"/>')
    const htmlElement = dom.window.document.querySelector('html')!

    expect(isInteractiveElement(htmlElement)).toBeFalsy()
  })

  it('does not detect div as an interactive element', () => {
    const dom = new JSDOM('<div/>')
    const divElement = dom.window.document.querySelector('div')!

    expect(isInteractiveElement(divElement)).toBeFalsy()
  })

  it('does not detect list as an interactive element', () => {
    const dom = new JSDOM('<li/>')
    const listElement = dom.window.document.querySelector('li')!

    expect(isInteractiveElement(listElement)).toBeFalsy()
  })

  it('does not detect list item as an interactive element', () => {
    const dom = new JSDOM('<ul/>')
    const listItemElement = dom.window.document.querySelector('ul')!

    expect(isInteractiveElement(listItemElement)).toBeFalsy()
  })

  it('does not detect fieldSet item as an interactive element', () => {
    const dom = new JSDOM('<fieldSet/>')
    const fieldSetItemElement: HTMLElement = dom.window.document.querySelector('fieldSet')!
    expect(isInteractiveElement(fieldSetItemElement)).toBeFalsy()
  })
})
