import TestNameHandler from './TestNameHandler'

const GRAVITY_SESSION_STORAGE_KEY_TEST_NAME = 'gravity-test-name'

export default class SessionStorageTestNameHandler implements TestNameHandler {
  getCurrentTestName(cypress?: any): string | null {
    if (cypress?.currentTest !== undefined) {
      return cypress.currentTest.titlePath.join(' > ')
    }
    return null
  }

  getPreviousTestName(): string | null {
    return window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_TEST_NAME)
  }

  isNewTest(): boolean {
    return this.getCurrentTestName() !== null && this.getCurrentTestName() !== this.getPreviousTestName()
  }

  refresh(): void {
    const currentTest = this.getCurrentTestName()
    if (currentTest !== null) window.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_TEST_NAME, currentTest)
  }
}
