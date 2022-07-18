export enum EventType {
  SessionStarted = 'sessionStarted',
  Click = 'click',
  Change = 'change'
}

export type TEvent = GravitySessionStartedEvent | GravityEvent | GravityCustomEvent
export type GravityEventData = GravityClickEventData

export type HTMLInputWithValue = HTMLInputElement | HTMLTextAreaElement

export interface EventCommonProperties {
  type: EventType
  location: GravityLocation
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

export type GravityEventTarget = | {
  element: string
  screenshot?: string
  selector?: string
  textContent?: string
  value?: string
  attributes?: Record<string, string>
} | Record<string, string>

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

export type CollectorOptions = {
  debug: boolean
} & (GravityEventHandlerOptions | ConsoleEventHandlerOptions)

export interface GravityEventHandlerOptions {
  authKey: string
}

export interface ConsoleEventHandlerOptions {
  simulation?: boolean
  maxDelay?: number
}

export interface GravityClickEventData {
  clickOffsetX: number
  clickOffsetY: number
  elementRelOffsetX?: number
  elementRelOffsetY?: number
  elementOffsetX?: number
  elementOffsetY?: number
}
