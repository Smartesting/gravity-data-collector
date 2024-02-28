import { beforeEach, describe, expect, it } from 'vitest'
import { QueryType } from '../types'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { createSelectors } from './createSelectors'
import { readFileSync } from 'fs'
import path from 'path'

describe('createSelector', () => {
  const html = `
  <body>
    <div id='some-id' class='my-container' data-testid='container' role='main'>
      <input id='text-5' type='search' />
    </div>
  </body>`

  let element: Element

  beforeEach(() => {
    element = createElementInJSDOM(html, 'div').element
  })

  it('returns the selectors for the element', () => {
    const selectors = createSelectors(element)
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {
        id: '#some-id',
        class: '.my-container',
        tag: 'div',
        nthChild: ':nth-child(2) > :nth-child(1)',
      },
      attributes: {
        'data-testid': 'container',
      },
    })
  })

  it('does not return unavailable selectors for the element', () => {
    element = createElementInJSDOM(
      `
      <body>
        <div>
          <input type='search' />
        </div>
      </body>`,
      'div',
    ).element

    const selectors = createSelectors(element)
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {
        tag: 'div',
        nthChild: ':nth-child(2) > :nth-child(1)',
      },
      attributes: {},
    })
  })

  it('only provides asked selectors', () => {
    const selectors = createSelectors(element, { queries: [QueryType.class] })
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {
        class: '.my-container',
      },
      attributes: {
        'data-testid': 'container',
      },
    })
  })

  it('only provides asked selectors #2', () => {
    const input = createElementInJSDOM(html, 'input').element
    const selectors = createSelectors(input, { queries: [QueryType.class, QueryType.attributes] })
    expect(selectors).toEqual({
      xpath: '/html/body/div/input',
      query: {
        class: '.my-container > *',
        attributes: '[type="search"]',
      },
      attributes: {},
    })
  })

  it('does not provide any selector if none are asked', () => {
    const selectors = createSelectors(element, { queries: [] })
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {},
      attributes: {
        'data-testid': 'container',
      },
    })
  })

  it('excludes the selectors specified by `excludedQueries`', () => {
    const selectors = createSelectors(element, { excludedQueries: [QueryType.nthChild, QueryType.tag] })
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {
        id: '#some-id',
        class: '.my-container',
      },
      attributes: {
        'data-testid': 'container',
      },
    })
  })

  it('excludes the selectors specified by `excludedQueries` in combined', () => {
    element = createElementInJSDOM(html, 'input').element
    const selectors = createSelectors(element, { excludedQueries: [QueryType.id, QueryType.attributes, QueryType.tag] })
    expect(selectors).toEqual({
      xpath: '/html/body/div/input',
      query: {
        class: '.my-container > *',
        combined: '.my-container > :nth-child(1)',
        nthChild: ':nth-child(2) > :nth-child(1) > :nth-child(1)',
      },
      attributes: {},
    })
  })

  it('provides the asked attributes', () => {
    const selectors = createSelectors(element, {
      queries: [],
      attributes: ['role'],
    })
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {},
      attributes: {
        role: 'main',
      },
    })
  })

  it('provides the data-testid attribute by default', () => {
    const selectors = createSelectors(element, {
      queries: [],
    })
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {},
      attributes: {
        'data-testid': 'container',
      },
    })
  })

  it('does not provide missing attributes', () => {
    const selectors = createSelectors(element, {
      queries: [],
      attributes: ['href'],
    })
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {},
      attributes: {},
    })
  })

  it('fallbacks to more generic options when needed', () => {
    const sample = readFileSync(path.join(__dirname, '..', '..', 'samples', 'index.html'), 'utf-8')
    const hamster = createElementInJSDOM(sample, 'option[value=hamster').element

    expect(createSelectors(hamster)).toEqual({
      xpath: '/html/body/div/fieldset[3]/div/select/option[4]',
      attributes: {},
      query: {
        nthChild: ':nth-child(2) > :nth-child(4)',
        combined: '#pet-select > :nth-child(4)',
      },
    })
  })
})
