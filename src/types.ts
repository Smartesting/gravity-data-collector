export { sendSessionUserActions } from './user-action/sessionUserActionSender'

export enum UserActionType {
  SessionStarted = 'sessionStarted',
  Click = 'click',
  Change = 'change',
  KeyUp = 'keyup',
  KeyDown = 'keydown',
  AsyncRequest = 'asyncRequest',
}

export type UserAction = SessionStartedUserAction | TargetedUserAction | AsyncRequest

export type AsyncRequest = {
  pathname: string
  method: string
} & UserActionProperties

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
  selector?: string
  value?: string
  type?: string
  displayInfo?: TargetDisplayInfo
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
  excludeRegex: RegExp | null
  customSelector?: string
  sessionsPercentageKept: number
  rejectSession: () => boolean
  onPublish?: (userActions: SessionUserAction[]) => void
  originsToRecord?: string[]
}

export type SessionTraits = Record<string, SessionTraitValue>

export type SessionTraitValue = string | number | boolean

export const ALLOWED_SESSION_TRAIT_VALUE_TYPES = ['string', 'boolean', 'number']
