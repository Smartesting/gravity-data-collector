import { Attributes, CreateSelectorsOptions, Query, QueryType, Selectors } from "../types";
import unique, { SelectorType } from 'unique-selector'
import getXPath from './getXPath'

const defaultCreateSelectorsOptions: CreateSelectorsOptions = {
  queries: [QueryType.id, QueryType.class, QueryType.tag, QueryType.nthChild],
  excludedQueries: [],
  attributes: [],
}

export function createSelectors(
  element: Element,
  options?: Partial<CreateSelectorsOptions>
): Selectors {
  const { queries, excludedQueries, attributes } = {
    ...defaultCreateSelectorsOptions,
    ...options
  }

  return {
    xpath: getXPath(element),
    query: makeQuery(element, queries, excludedQueries),
    attributes: makeAttributes(element, attributes)
  }
}

function makeQuery(element: Element, queries: QueryType[], excludedQueries: QueryType[]): Query {
  const selectors: string[] = []

  const queryMap = queries.reduce((acc, query) => {
    if (excludedQueries.includes(query)) return acc

    const selectorTypes: SelectorType[] = [queryTypeToSelectorType(query)]
    const selector = unique(element, { selectorTypes})
    if (selector) {
      selectors.push(selector)
      acc[query] = selector
    }
    return acc
  }, {} as Query)

  const combined = unique(element, {selectorTypes: queries.map(queryTypeToSelectorType)})
  if (combined && !selectors.includes(combined)) return {
    ...queryMap,
    combined
  }

  return queryMap
}

function queryTypeToSelectorType(query: QueryType): SelectorType {
  const queryToSelector: Record<QueryType, SelectorType> = {
    [QueryType.id]: 'ID',
    [QueryType.class]: 'Class',
    [QueryType.tag]: 'Tag',
    [QueryType.nthChild]: 'NthChild',
    [QueryType.attributes]: 'Attributes'
  }

  return queryToSelector[query]
}

function makeAttributes(element: Element, attributes: string[]): Attributes {
  return attributes.reduce((acc, attribute) => {
    const value = element.getAttribute(attribute)
    if (value) { acc[attribute] = value}
    return acc
  }, {} as Attributes)
}