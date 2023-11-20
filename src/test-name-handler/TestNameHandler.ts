import { CypressObject } from '../types'

export default interface TestNameHandler {
  getCurrentTestName: (cypress?: CypressObject) => string | null

  getPreviousTestName: () => string | null

  isNewTest: () => boolean

  refresh: () => void
}
