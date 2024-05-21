import { AnonymizationSettings } from '../types'
import { matchClosest } from './cssSelectorUtils'

export default function elementShouldBeAnonymized(element: HTMLElement, anonymizationSettings: AnonymizationSettings) {
  return (
    anonymizationSettings.anonymize &&
    !anonymizationSettings.allowList.some(({ pageMatcher, allowedSelectors }) => {
      return (
        document.location.pathname.match(pageMatcher) !== null &&
        allowedSelectors.some((selector) => matchClosest(element, selector))
      )
    })
  )
}
