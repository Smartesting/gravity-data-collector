import TestNameHandler from './TestNameHandler'

const GRAVITY_SESSION_STORAGE_KEY_TEST_NAME = 'gravity-test-name'

export default class SessionStorageTestNameHandler implements TestNameHandler {
  getCurrent(): string | null {
    const cypress = (window as any).Cypress
    if (cypress?.currentTest !== undefined) {
      return cypress.currentTest.titlePath.join(' > ')
    }
    return null
  }

  getPrevious(): string | null {
    return window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_TEST_NAME)
  }

  isNewTest(): boolean {
    return this.getCurrent() !== null && this.getCurrent() !== this.getPrevious()
  }

  refresh(): void {
    const currentTest = this.getCurrent()
    if (currentTest !== null) window.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_TEST_NAME, currentTest)
  }
}
