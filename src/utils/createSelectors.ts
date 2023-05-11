import { Attributes, CreateSelectorsOptions, Query, QueryType, Selectors } from "../types";
import unique, { SelectorType } from 'unique-selector'
import getXPath from './getXPath'

const defaultCreateSelectorsOptions: CreateSelectorsOptions = {
  queries: [QueryType.id, QueryType.class, QueryType.tag],
  attributes: [],
}

export function createSelectors(
  element: Element,
  options?: Partial<CreateSelectorsOptions>
): Selectors {
  const { queries, attributes } = {
    ...defaultCreateSelectorsOptions,
    ...options
  }

  return {
    xpath: getXPath(element),
    query: makeQuery(element, queries),
    attributes: makeAttributes(element, attributes)
  }
}

function makeQuery(element: Element, queries: QueryType[]): Query {
  const queryToSelector: Record<QueryType, SelectorType> = {
    [QueryType.id]: 'ID',
    [QueryType.class]: 'Class',
    [QueryType.tag]: 'Tag'
  }

  return queries.reduce((acc, query) => {
    const selector = unique(element, { selectorTypes: [queryToSelector[query]]})
    if (selector) { acc[query] = selector}
    return acc
  }, {} as Query)
}

function makeAttributes(element: Element, attributes: string[]): Attributes {
  return attributes.reduce((acc, attribute) => {
    const value = element.getAttribute(attribute)
    if (value) { acc[attribute] = value}
    return acc
  }, {} as Attributes)
}