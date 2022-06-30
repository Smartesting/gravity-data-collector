export type TEvent = GravitySessionStartedEvent | GravityEvent | GravityCustomEvent | GravityRequestEvent;
export type GravityEventData = GravityClickEventData;

export type GravitySessionStartedEvent = {
    type: string;
    location: GravityLocation;
    recordedAt?: number;
    viewportData: ViewportData;
    test?: string;
};

export type GravityEvent = {
    type: string;
    location: GravityLocation;
    recordedAt?: number;
    target?: GravityEventTarget;
    viewportData: ViewportData;
    eventData?: GravityEventData;
};

export type GravityCustomEvent = {
    type: string;
    location: GravityLocation;
    recordedAt?: number;
    name: string;
    customData: CustomEventDataType;
    viewportData: ViewportData;
};

export type GravityRequestEvent = {
    type: string;
    requestData: {
        type: string;
        url: string | URL;
        method: string;
        body: string;
        location: GravityLocation;
        recordedAt?: number;
    };
    responseData: {
        type: string;
        status: number;
        body: string;
        location: GravityLocation;
        recordedAt?: number;
    };
};

export type GravityEventTarget =
    | {
    element: string;
    screenshot?: string
    selector?: string;
    textContent?: string;
    value?: string;
    attributes?: Record<string, string>;
}
    | Record<string, string>;

export type GravityLocation = {
    href: string;
    pathname: string;
    search: string;
};

export type CustomEventDataType = Record<string, string | number | boolean | Date>;

export type ViewportData = {
    viewportWidth?: number;
    viewportHeight?: number;
    windowWidth?: number;
    windowHeight?: number;
    screenWidth?: number;
    screenHeight?: number;
    availScreenWidth?: number;
    availScreenHeight?: number;
    orientation?: string;
    colorDepth?: number;
    pixelDepth?: number;
};

export type CollectorOptions = {
    baseUrl: string;
    debug?: boolean;
    authorizeBatch?: boolean;
    logRequests?: boolean;
};

export type GravityClickEventData = {
    elementRelOffsetX: number;
    elementRelOffsetY: number;
    clickOffsetX: number;
    clickOffsetY: number;
    elementOffsetX: number;
    elementOffsetY: number;
};
