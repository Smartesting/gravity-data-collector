type Log = GravitySessionStartedEvent | GravityEvent | GravityCustomEvent | GravityRequestEvent;
type GravityEventData = GravityClickEventData;

type GravitySessionStartedEvent = {
  type: string;
  location: GravityLocation;
  recordedAt?: number;
  viewportData: ViewportData;
  test?: string;
};

type GravityEvent = {
  type: string;
  location: GravityLocation;
  recordedAt?: number;
  target?: GravityEventTarget;
  viewportData: ViewportData;
  eventData?: GravityEventData;
};

type GravityCustomEvent = {
  type: string;
  location: GravityLocation;
  recordedAt?: number;
  name: string;
  customData: CustomEventDataType;
  viewportData: ViewportData;
};

type GravityRequestEvent = {
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

type GravityEventTarget =
  | {
      element: string;
      screenshot?: string
      selector?: string;
      textContent?: string;
      value?: string;
      attributes?: Record<string, string>;
    }
  | Record<string, string>;

type GravityLocation = {
  href: string;
  pathname: string;
  search: string;
};

type CustomEventDataType = Record<string, string | number | boolean | Date>;

type ViewportData = {
  viewportWidth?: number;
  viewportHeight?: number;
  windowWidth?: number;
  windowHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
  availScreenWidth?: number;
  avaiScreenHeight?: number;
  orientation?: string;
  colorDepth?: number;
  pixelDepth?: number;
};

type TLoggerOptions = {
  baseUrl: string;
  debug?: boolean;
  authorizeBatch?: boolean;
  logRequests?: boolean;
};

type GravityClickEventData = {
  elementRelOffsetX: number;
  elementRelOffsetY: number;
  clickOffsetX: number;
  clickOffsetY: number;
  elementOffsetX: number;
  elementOffsetY: number;
};
