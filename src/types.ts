export { sendMovements as sendSessionUserActions } from './movement/sessionMovementSender'

export enum UserActionType {
  SessionStarted = 'sessionStarted',
  Click = 'click',
  Change = 'change',
  KeyUp = 'keyup',
  KeyDown = 'keydown',
}

export type Movement = UserAction | DomMutation

export type SessionMovement = Movement & {
  sessionId: string
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

export interface DomMutation {
  target: string[]
  addedElements: string[][]
  removedElements: string[][]
  type: 'attributes' | 'childList' | 'characterData'
  attributeName?: string
}

export interface KeyUserActionData {
  key: string
  code: string
}

export type HTMLInputWithValue = HTMLInputElement | HTMLTextAreaElement

export interface UserActionTarget {
  element: string
  selector?: string[]
  xpath: string
  value?: string
  type?: string
  displayInfo?: TargetDisplayInfo
  extra?: HTMLFormExtra
}

export interface TargetDisplayInfo {
  placeholder?: string
  label?: string
  text?: string
}

export interface HTMLFormExtra {
  parentForm: string[]
  formAction: string
  formMethod: string
  formTarget: string
}

export interface HTMLSubmitExtra {
  parentForm: string[]
  formAction: string
  formMethod: string
  formTarget: string
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
  onPublish?: (movements: Movement[]) => void
}

export type SessionTraits = Record<string, SessionTraitValue>

export type SessionTraitValue = string | number | boolean

export const ALLOWED_SESSION_TRAIT_VALUE_TYPES = ['string', 'boolean', 'number']
