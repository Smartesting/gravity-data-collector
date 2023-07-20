export const GRAVITY_SERVER_ADDRESS = 'https://gravityserver-canary.herokuapp.com'

export function buildGravityTrackingPublishApiUrl(authKey: string, gravityServerUrl: string) {
  return `${trackingUrlStartPart(gravityServerUrl)}/${authKey}/publish`
}

export function buildGravityTrackingIdentifySessionApiUrl(
  authKey: string,
  gravityServerUrl: string,
  sessionId: string,
) {
  return `${trackingUrlStartPart(gravityServerUrl)}/${authKey}/identify/${sessionId}`
}

export function trackingUrlStartPart(gravityServerUrl: string) {
  return `${gravityServerUrl}/api/tracking`
}

export function buildGravityTrackingMonitorSessionApiUrl(authKey: string, gravityServerUrl: string, sessionId: string) {
  return `${trackingUrlStartPart(gravityServerUrl)}/${authKey}/monitor/${sessionId}`
}
