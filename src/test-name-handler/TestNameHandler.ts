export default interface TestNameHandler {
  getCurrent: () => string | null

  getPrevious: () => string | null

  isNewTest: () => boolean

  refresh: () => void
}
