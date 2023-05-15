export { sendSessionUserActions } from './user-action/sessionUserActionSender'

export enum UserActionType {
  SessionStarted = 'sessionStarted',
  Click = 'click',
  Change = 'change',
  KeyUp = 'keyup',
  KeyDown = 'keydown',
}

export type UserAction = SessionStartedUserAction | TargetedUserAction

export type SessionStartedUserAction = {
  test?: string
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

export type Query = Partial<{
  [key in QueryType]: string
} & { combined: string}>

export enum QueryType {
  id = 'id',
  class = 'class',
  tag = 'tag',
  nthChild = 'nthChild',
  attributes = 'attributes'
}

export interface Attributes {[key: string]: string}

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
  onPublish?: (userActions: SessionUserAction[]) => void
}

export interface CreateSelectorsOptions {
  queries: QueryType[]
  excludedQueries: QueryType[]
  attributes: string[]
}

export type SessionTraits = Record<string, SessionTraitValue>

export type SessionTraitValue = string | number | boolean

export const ALLOWED_SESSION_TRAIT_VALUE_TYPES = ['string', 'boolean', 'number']
