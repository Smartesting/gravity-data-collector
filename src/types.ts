// noinspection JSUnusedGlobalSymbols // some values are used/defined by Gravity server

export enum UserActionType {
  SessionStarted = 'sessionStarted',
  Click = 'click',
  DblClick = 'dblclick',
  ContextMenu = 'contextmenu',
  Change = 'change',
  KeyUp = 'keyup',
  KeyDown = 'keydown',
  Copy = 'copy',
  Cut = 'cut',
  Paste = 'paste',
  Select = 'select',
  DragStart = 'dragstart',
  Drop = 'drop',
  Play = 'play',
  Pause = 'pause',
  Seeked = 'seeked',
  FullScreenChange = 'fullscreenchange',
  Resize = 'resize',
  HashChange = 'hashchange',
  Focus = 'focus',
  Blur = 'blur',
  Submit = 'submit',
  Reset = 'reset',
  MouseEnter = 'mouseenter',
  MouseLeave = 'mouseleave',
  Scroll = 'scroll',
  Wheel = 'wheel',
  Toggle = 'toggle',
  TouchStart = 'touchstart',
  TouchMove = 'touchmove',
  TouchEnd = 'touchend',
  TouchCancel = 'touchcancel',
  AsyncRequest = 'asyncRequest',
  TestCommand = 'testCommand',
}

export enum Listener {
  Click = 'click',
  DblClick = 'dblclick',
  ContextMenu = 'contextmenu',
  Change = 'change',
  KeyUp = 'keyup',
  KeyDown = 'keydown',
  Copy = 'copy',
  Cut = 'cut',
  Paste = 'paste',
  Select = 'select',
  DragStart = 'dragstart',
  Drop = 'drop',
  Play = 'play',
  Pause = 'pause',
  Seeked = 'seeked',
  FullScreenChange = 'fullscreenchange',
  Resize = 'resize',
  HashChange = 'hashchange',
  Focus = 'focus',
  Blur = 'blur',
  Submit = 'submit',
  Reset = 'reset',
  MouseEnter = 'mouseenter',
  MouseLeave = 'mouseleave',
  Scroll = 'scroll',
  Wheel = 'wheel',
  Toggle = 'toggle',
  TouchStart = 'touchstart',
  TouchMove = 'touchmove',
  TouchEnd = 'touchend',
  TouchCancel = 'touchcancel',
  BeforeUnload = 'beforeUnload',
  Requests = 'requests',
  CypressCommands = 'cypressCommands',
}

export type UserAction = SessionStartedUserAction | TargetedUserAction | AsyncRequest

export type ListenerFn = (...values: any[]) => void

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
  interactiveTarget?: UserActionTarget
  userActionData?: UserActionData
} & UserActionProperties

export interface UserActionProperties {
  type: UserActionType
  location: GravityLocation
  document: GravityDocument
  recordedAt?: string
  viewportData: ViewportData
}

export type UserActionData = TargetActionData & (KeyUserActionData | MouseActionData | {})

export interface TargetActionData {
  elementPosition: ElementPosition
  scrollableAncestors: ReadonlyArray<ScrollableAncestor>
}

export interface ScrollableAncestor {
  selectors: Selectors
  elementPosition: ElementPosition
  scrollX: number
  scrollY: number
}

export interface ElementPosition {
  offsetTop: number
  offsetLeft: number
  boundingOffsetTop: number
  boundingOffsetLeft: number
  width: number
  height: number
}

export interface MouseActionData {
  clientX: number
  clientY: number
  elementRelOffsetX: number
  elementRelOffsetY: number
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

export type CollectorOptions = CookieSettings & {
  authKey: string
  requestInterval: number
  gravityServerUrl: string
  debug: boolean
  maxDelay: number
  selectorsOptions: Partial<CreateSelectorsOptions> | undefined
  sessionsPercentageKept: number
  rejectSession: () => boolean
  onPublish: ((userActions: ReadonlyArray<SessionUserAction>) => void) | undefined
  recordRequestsFor: string[] | undefined
  window: typeof window
  enabledListeners: Listener[] | undefined
  buildId: string | undefined
  useHashInUrlAsPathname: boolean
  logger?: typeof console.log
}

export enum CookieStrategy {
  default = 'default',
  subDomains = 'subDomains',
  iframeEmbedding = 'iframeEmbedding',
}

export interface CookieOptions {
  Path: string
  Domain: string
  SameSite: 'Strict' | 'Lax' | 'None'
  Secure: boolean
}

export interface CookieSettings {
  cookieStrategy: CookieStrategy
  cookieWriter: ((key: string, value: string, options: Partial<CookieOptions>) => string) | null
}

export interface NoAnonymizationSettings {
  anonymize: false
}

export interface WithAnonymizationSettings {
  anonymize: true
  allowList: ReadonlyArray<{
    pageMatcher: string
    allowedSelectors: ReadonlyArray<string>
  }>
}

export type AnonymizationSettings = NoAnonymizationSettings | WithAnonymizationSettings

export interface GravityRecordingSettings {
  sessionRecording: boolean
  videoRecording: boolean
  anonymizationSettings?: AnonymizationSettings
}

export const DEFAULT_ANONYMIZATION_SETTINGS: AnonymizationSettings = { anonymize: true, allowList: [] }

export const NO_RECORDING_SETTINGS: GravityRecordingSettings = {
  sessionRecording: false,
  videoRecording: false,
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
}

export interface AddSessionRecordingResponse {
  error: AddSessionRecordingError | null
}

export enum AddSessionRecordingError {
  accessDenied = 'no_access',
  projectExpired = 'project_expired',
  projectNotFound = 'project_not_found',
  collectionNotFound = 'collection_not_found',
  sessionNotFound = 'session_not_found',
  notUUID = 'not_a_uuid',
  invalidFormat = 'invalid_format',
}

export interface GravityRecordingSettingsResponse {
  settings: GravityRecordingSettings | null
  error: GravityRecordingSettingsError | null
}

export enum GravityRecordingSettingsError {
  accessDenied = 'no_access',
  projectExpired = 'project_expired',
  projectNotFound = 'project_not_found',
  collectionNotFound = 'collection_not_found',
  incorrectSource = 'incorrect_source',
}

export const CLICKABLE_ELEMENT_TAG_NAMES: ReadonlyArray<keyof HTMLElementTagNameMap> = [
  'a',
  'button',
  'nav',
  'input',
  'li',
]

export type Logger = typeof console.log
