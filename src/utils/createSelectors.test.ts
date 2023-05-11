import { describe, beforeEach, expect, it } from 'vitest'
import {  QueryType } from "../types";
import createElementInJSDOM from '../test-utils/createElementInJSDOM';
import { createSelectors } from './createSelectors';

describe('createSelector', () => {
  let element: Element

  beforeEach(() => {
    element = createElementInJSDOM(
      `
      <body>
        <div id="some-id" class="my-container" data-testid="container">
          <input id='text-5' type='search' />
        </div>
      </body>`,
      'div',
    ).element
  })

  it('returns the selectors for the element', () => {
    const selectors = createSelectors(element)
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {
        id: '#some-id',
        class: '.my-container',
        tag: 'div'
      },
      attributes: {}
    })
  })

  it('do not return unavailable selectors for the element', () => {
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
        tag: 'div'
      },
      attributes: {}
    })
  })

  it('only provide asked selectors', () => {
    const selectors = createSelectors(element, {queries: [QueryType.class]})
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {
        class: '.my-container',
      },
      attributes: {}
    })
  })

  it('does not provide any selector if none are asked', () => {
    const selectors = createSelectors(element, {queries: []})
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {},
      attributes: {}
    })
  })

  it('provides the asked attributes', () => {
    const selectors = createSelectors(element, {queries: [], attributes: ['data-testid']})
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {},
      attributes: {
        'data-testid': 'container'
      }
    })
  })

  it('does not provide missing attributes', () => {
    const selectors = createSelectors(element, {queries: [], attributes: ['role']})
    expect(selectors).toEqual({
      xpath: '/html/body/div',
      query: {},
      attributes: {}
    })
  })
})