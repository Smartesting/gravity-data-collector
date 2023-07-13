import { TestContext, TestingTool, TestSuite } from '../types'

export function makeCypressTestContext(): TestContext | null {
  const currentTest = (window as any).Cypress?.currentTest
  if (currentTest === undefined) {
    return null
  }
  const testContext: TestContext = {
    title: currentTest.title,
    titlePath: currentTest.titlePath,
    testingTool: TestingTool.CYPRESS,
  }
  const suite = extractTestSuite()
  if (suite !== undefined) {
    testContext.suite = suite
  }
  return testContext
}

function extractTestSuite(): TestSuite | undefined {
  const mochaSuite = (window as any).Cypress?.mocha?.getRunner()?.suite
  return mochaSuite === undefined ? undefined : buildTestSuite(mochaSuite)
}

function buildTestSuite(mochaSuite: MochaSuite | undefined): TestSuite | undefined {
  if (mochaSuite === undefined) {
    return undefined
  }
  const testSuite: TestSuite = {
    title: mochaSuite.title,
    file: mochaSuite.file,
  }
  const parent = buildTestSuite(mochaSuite.parent)
  if (parent !== undefined) {
    testSuite.parent = parent
  }
  return testSuite
}

interface MochaSuite {
  title: string
  file: null | string
  parent?: MochaSuite
}
