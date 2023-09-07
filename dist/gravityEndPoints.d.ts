export declare const GRAVITY_SERVER_ADDRESS = "https://api.gravity.smartesting.com";
export declare function buildGravityTrackingPublishApiUrl(authKey: string, gravityServerUrl: string): string;
export declare function buildGravityTrackingIdentifySessionApiUrl(authKey: string, gravityServerUrl: string, sessionId: string): string;
export declare function trackingUrlStartPart(gravityServerUrl: string): string;
