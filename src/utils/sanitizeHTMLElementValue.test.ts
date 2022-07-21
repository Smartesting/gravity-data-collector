import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import { sanitizeHTMLElementValue } from '../utils/sanitizeHTMLElementValue'

describe('sanitizeHTMLElementValue', () => {
  it('sanitizes any text input', () => {
    const element = selectTextAreaInDom(new JSDOM('<textarea/>secret text to be kept confidential</textarea>'))
    expect(sanitizeHTMLElementValue(element)).toBe('{{textarea}}')
  })

  it('sanitizes any text input', () => {
    const element = selectInputInDom(new JSDOM('<input value="s3cr3t"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('{{text}}')
  })

  it('sanitizes any email input', () => {
    const element = selectInputInDom(new JSDOM('<input type="email" value="s3.cr3t@mail.com"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('{{email}}')
  })

  it('sanitizes any file input', () => {
    const element = selectInputInDom(new JSDOM('<input type="file" value="s3cr3t.txt"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('{{file}}')
  })

  it('sanitizes any password input', () => {
    const element = selectInputInDom(new JSDOM('<input type="password" value="s3cr3t"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('{{password}}')
  })

  it('sanitizes any tel input', () => {
    const element = selectInputInDom(new JSDOM('<input type="tel" value="0123456789"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('{{tel}}')
  })

  it('sanitizes any url input', () => {
    const element = selectInputInDom(new JSDOM('<input type="url" value="www.s3cr3t.com"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('{{url}}')
  })

  it('sanitizes any hidden input', () => {
    const element = selectInputInDom(new JSDOM('<input type="hidden" value="s3cr3t"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('{{hidden}}')
  })

  it('sanitizes any number input', () => {
    const element = selectInputInDom(new JSDOM('<input type="number" value="42"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('{{number}}')
  })

  it('does not sanitize checkbox inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="checkbox" value="accept all" checked/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('true')
  })

  it('does not sanitize radio inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="radio" value="red" checked/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('true')
  })

  it('does not sanitize search inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="search" value="the best test automation solution"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('the best test automation solution')
  })

  it('does not sanitize date inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="date" value="2022-07-12"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('2022-07-12')
  })

  it('does not sanitize date-time inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="datetime-local" value="2022-07-12T15:30"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('2022-07-12T15:30')
  })

  it('does not sanitize time inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="time" value="13:30"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('13:30')
  })

  it('does not sanitize month inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="month" value="2022-07"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('2022-07')
  })

  it('does not sanitize week inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="week" value="2017-W01"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('2017-W01')
  })

  it('does not sanitize color inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="color" value="#f6b73c"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('#f6b73c')
  })

  it('does not sanitize button inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="button" value="Click here"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('Click here')
  })

  it('does not sanitize submit inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="submit" value="Click to submit"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('Click to submit')
  })

  it('does not sanitize reset inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="reset" value="Click to reset"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('Click to reset')
  })

  it('does not sanitize range inputs', () => {
    const element = selectInputInDom(new JSDOM('<input type="range" value="90"/>'))
    expect(sanitizeHTMLElementValue(element)).toBe('90')
  })
})

function selectInputInDom(dom: JSDOM): HTMLInputElement {
  return dom.window.document.querySelector('input') as unknown as HTMLInputElement
}

function selectTextAreaInDom(dom: JSDOM): HTMLTextAreaElement {
  return dom.window.document.querySelector('textarea') as unknown as HTMLTextAreaElement
}