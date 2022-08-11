export enum EventType {
  SessionStarted = 'sessionStarted',
  Click = 'click',
  Change = 'change',
  KeyUp = 'keyup',
  KeyDown = 'keydown',
}

export type TEvent = GravitySessionStartedEvent | GravityEvent | GravityCustomEvent
export type GravityEventData = GravityClickEventData | GravityKeyEventData

export type HTMLInputWithValue = HTMLInputElement | HTMLTextAreaElement

export interface EventCommonProperties {
  type: EventType
  location: GravityLocation
  document: GravityDocument
  recordedAt?: string
  viewportData: ViewportData
}

export type GravitySessionStartedEvent = {
  test?: string
  version: string
  agent: string
} & EventCommonProperties

export type GravityEvent = {
  target?: GravityEventTarget
  eventData?: GravityEventData
} & EventCommonProperties

export type GravityCustomEvent = {
  name: string
  customData: CustomEventDataType
} & EventCommonProperties

export interface EventTargetAttributes {
  type?: string
}

export interface GravityEventTarget {
  element: string
  selector?: string
  value?: string
  attributes?: EventTargetAttributes
}

export interface GravityLocation {
  href: string
  pathname: string
  search: string
}

export type CustomEventDataType = Record<string, string | number | boolean | Date>

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
}

export interface GravityClickEventData {
  clickOffsetX: number
  clickOffsetY: number
  elementRelOffsetX?: number
  elementRelOffsetY?: number
  elementOffsetX?: number
  elementOffsetY?: number
}

export interface GravityKeyEventData {
  key: string
  code: string
}

export type SessionEvent = {
  sessionId: string
} & TEvent
