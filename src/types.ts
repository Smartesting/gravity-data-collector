import Cypress from 'cypress'

export enum UserActionType {
  SessionStarted = 'sessionStarted',
  Click = 'click',
  Change = 'change',
  KeyUp = 'keyup',
  KeyDown = 'keydown',
  AsyncRequest = 'asyncRequest',
  TestCommand = 'testCommand',
}

export type UserAction = SessionStartedUserAction | TargetedUserAction | AsyncRequest | TestCommand

export type TestCommand = {
  command: CypressCommand
} & UserActionProperties

export enum CypressEvent {
  COMMAND_START = 'command:start',
  COMMAND_END = 'command:end',
}

export interface CypressCommand {
  event: CypressEvent
  name: string
  args: readonly any[]
  id: string
  chainerId: string
  prevId?: string
  nextId?: string
  userInvocationStack: string
  type?: string
}

export type CypressObject = Cypress.Cypress & CyEventEmitter

export type AsyncRequest = {
  url: string
  method: string
} & UserActionProperties

export interface TestSuite {
  title: string
  file: string | null
  parent?: TestSuite
}

export enum TestingTool {
  CYPRESS = 'cypress',
  PLAYWRIGHT = 'playwright',
}

export interface TestContext {
  title: string
  titlePath: readonly string[]
  testingTool: TestingTool
  suite?: TestSuite
}

export type SessionStartedUserAction = {
  test?: string
  testContext?: TestContext
  version: string
  agent: string
  buildId?: string
} & UserActionProperties

export type TargetedUserAction = {
  target: UserActionTarget
  userActionData?: UserActionData
} & UserActionProperties

export interface UserActionProperties {
  type: UserActionType
  location: GravityLocation
  document: GravityDocument
  recordedAt?: string
  viewportData: ViewportData
}

export type UserActionData = ClickUserActionData | KeyUserActionData

export interface ClickUserActionData {
  clickOffsetX: number
  clickOffsetY: number
  elementRelOffsetX?: number
  elementRelOffsetY?: number
  elementOffsetX?: number
  elementOffsetY?: number
}

export interface KeyUserActionData {
  key: string
  code: string
}

export type SessionUserAction = UserAction & {
  sessionId: string
}

export type HTMLInputWithValue = HTMLInputElement | HTMLTextAreaElement

export interface UserActionTarget {
  element: string
  /**
   * @deprecated Use selectors instead.
   */
  selector?: string
  selectors?: Selectors
  value?: string
  type?: string
  displayInfo?: TargetDisplayInfo
}

export interface Selectors {
  xpath: string
  query: Query
  attributes: Attributes
}

export type Query = Partial<
  {
    [key in QueryType]: string
  } & { combined: string }
>

export enum QueryType {
  id = 'id',
  class = 'class',
  tag = 'tag',
  nthChild = 'nthChild',
  attributes = 'attributes',
}

export interface Attributes {
  [key: string]: string
}

export interface TargetDisplayInfo {
  placeholder?: string
  label?: string
  text?: string
}

export interface GravityLocation {
  href: string
  pathname: string
  search: string
}

export interface ViewportData {
  viewportWidth?: number
  viewportHeight?: number
  windowWidth?: number
  windowHeight?: number
  screenWidth?: number
  screenHeight?: number
  availScreenWidth?: number
  availScreenHeight?: number
  orientation?: string
  colorDepth?: number
  pixelDepth?: number
}

export interface GravityDocument {
  title: string
}

export interface CollectorOptions {
  authKey: string
  requestInterval: number
  gravityServerUrl: string
  debug: boolean
  maxDelay: number
  /**
   * @deprecated Use selectorsOptions instead.
   */
  excludeRegex: RegExp | null
  /**
   * @deprecated Use selectorsOptions instead.
   */
  customSelector?: string
  selectorsOptions?: Partial<CreateSelectorsOptions>
  sessionsPercentageKept: number
  rejectSession: () => boolean
  onPublish?: (userActions: ReadonlyArray<SessionUserAction>) => void
  /**
   * @deprecated Use recordRequestsFor instead.
   */
  originsToRecord?: string[]
  recordRequestsFor?: string[]
  window?: typeof window
  enabledListeners?: Listener[]
  buildId?: string
}

export type CollectorOptionsWithWindow = CollectorOptions & {
  window: typeof window
}

export enum Listener {
  Click = 'click',
  KeyUp = 'keyUp',
  KeyDown = 'keyDown',
  Change = 'change',
  BeforeUnload = 'beforeUnload',
  Requests = 'requests',
  CypressCommands = 'cypressCommands',
}

export interface CreateSelectorsOptions {
  queries: QueryType[]
  excludedQueries: QueryType[]
  attributes: string[]
}

export type SessionTraits = Record<string, SessionTraitValue>

export type SessionTraitValue = string | number | boolean

export const ALLOWED_SESSION_TRAIT_VALUE_TYPES = ['string', 'boolean', 'number']

export interface AddSessionUserActionsResponse {
  error: AddSessionUserActionsError | null
}

export enum AddSessionUserActionsError {
  incorrectSource = 'incorrect_source',
  conflict = 'conflict',
  notUUID = 'not_a_uuid',
  collectionNotFound = 'collection_not_found',
  invalidFormat = 'invalid_format',
  projectNotFound = 'project_not_found',
  projectExpired = 'project_expired',

  /** @deprecated Use projectNotFound instead. */
  domainNotFound = 'domain_not_found',
  /** @deprecated Use projectExpired instead. */
  domainExpired = 'domain_expired',
}

export interface IdentifySessionResponse {
  error: IdentifySessionError | null
}

export enum IdentifySessionError {
  accessDenied = 'no_access',
  collectionNotFound = 'collection_not_found',
  sessionNotFound = 'session_not_found',
  invalidField = 'invalid_field',
  incorrectSource = 'incorrect_source',
  notUUID = 'not_a_uuid',
  projectNotFound = 'project_not_found',
  projectExpired = 'project_expired',

  /** @deprecated Use projectNotFound instead. */
  domainNotFound = 'domain_not_found',
  /** @deprecated Use projectExpired instead. */
  domainExpired = 'domain_expired',
}

export interface AddSessionRecordingResponse {
  error: AddSessionRecordingError | null
}

export enum AddSessionRecordingError {
  accessDenied = 'no_access',
  collectionNotFound = 'collection_not_found',
  sessionNotFound = 'session_not_found',
  invalidField = 'invalid_field',
  incorrectSource = 'incorrect_source',
  notUUID = 'not_a_uuid',
  projectNotFound = 'project_not_found',
  projectExpired = 'project_expired',

  /** @deprecated Use projectNotFound instead. */
  domainNotFound = 'domain_not_found',
  /** @deprecated Use projectExpired instead. */
  domainExpired = 'domain_expired',
}
