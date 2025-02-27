import { Attributes, CreateSelectorsOptions, Query, QueryType, Selectors } from '../types'
import unique, { SelectorType } from 'unique-selector'
import getXPath from 'get-xpath'

const defaultCreateSelectorsOptions: CreateSelectorsOptions = {
  queries: [QueryType.id, QueryType.class, QueryType.tag, QueryType.nthChild],
  excludedQueries: [],
  attributes: ['data-testid'],
}

export function createSelectors(element: Element, options?: Partial<CreateSelectorsOptions>): Selectors {
  const { queries, excludedQueries, attributes } = {
    ...defaultCreateSelectorsOptions,
    ...options,
  }

  return {
    xpath: getXPath(element, { ignoreId: true }),
    query: makeQuery(element, queries, excludedQueries),
    attributes: makeAttributes(element, attributes),
  }
}

function makeQuery(element: Element, queries: QueryType[], excludedQueries: QueryType[]): Query {
  const selectors: string[] = []
  const filteredQueries = queries.filter((query) => !excludedQueries.includes(query))

  const queryMap = filteredQueries.reduce<Query>((acc, query) => {
    const selectorTypes: SelectorType[] = [queryTypeToSelectorType(query)]
    try {
      const selector = unique(element, { selectorTypes })
      if (selector !== null) {
        selectors.push(selector)
        acc[query] = selector
      }
    } catch {}
    return acc
  }, {})

  try {
    const combined = unique(element, { selectorTypes: filteredQueries.map(queryTypeToSelectorType) })
    if (combined !== null && !selectors.includes(combined)) {
      return {
        ...queryMap,
        combined,
      }
    }
  } catch {}

  return queryMap
}

function queryTypeToSelectorType(query: QueryType): SelectorType {
  const queryToSelector: Record<QueryType, SelectorType> = {
    [QueryType.id]: 'ID',
    [QueryType.class]: 'Class',
    [QueryType.tag]: 'Tag',
    [QueryType.nthChild]: 'NthChild',
    [QueryType.attributes]: 'Attributes',
  }

  return queryToSelector[query]
}

function makeAttributes(element: Element, attributes: string[]): Attributes {
  return attributes.reduce<Attributes>((acc, attribute) => {
    const value = element.getAttribute(attribute)
    if (value !== null) {
      acc[attribute] = value
    }
    return acc
  }, {})
}
