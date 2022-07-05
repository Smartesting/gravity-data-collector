import EventType from "./event/eventType";

export type TEvent = GravitySessionStartedEvent | GravityEvent | GravityCustomEvent;
export type GravityEventData = GravityClickEventData;

export type EventCommonProperties = {
    type: EventType,
    location: GravityLocation,
    recordedAt?: number,
    viewportData: ViewportData,
}

export type GravitySessionStartedEvent = {
    test?: string,
    version: string
} & EventCommonProperties

export type GravityEvent = {
    target?: GravityEventTarget,
    eventData?: GravityEventData
} & EventCommonProperties

export type GravityCustomEvent = {
    name: string,
    customData: CustomEventDataType
} & EventCommonProperties

export type GravityEventTarget = | {
    element: string,
    screenshot?: string
    selector?: string,
    textContent?: string,
    value?: string,
    attributes?: Record<string, string>
} | Record<string, string>

export type GravityLocation = {
    href: string,
    pathname: string,
    search: string
}

export type CustomEventDataType = Record<string, string | number | boolean | Date>

export type ViewportData = {
    viewportWidth?: number,
    viewportHeight?: number,
    windowWidth?: number,
    windowHeight?: number,
    screenWidth?: number,
    screenHeight?: number,
    availScreenWidth?: number,
    availScreenHeight?: number,
    orientation?: string,
    colorDepth?: number,
    pixelDepth?: number
}

export type CollectorOptions = {} & ConsoleEventHandlerOptions

export type ConsoleEventHandlerOptions = {
    simulation?: boolean,
    maxDelay?: number
}

export type GravityClickEventData = {
    clickOffsetX: number,
    clickOffsetY: number,
    elementRelOffsetX?: number,
    elementRelOffsetY?: number,
    elementOffsetX?: number,
    elementOffsetY?: number
}
