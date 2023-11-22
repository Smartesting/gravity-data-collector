export const GRAVITY_SERVER_ADDRESS = 'https://gravity-api-canary.osc-fr1.scalingo.io'

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

export function buildGravityTrackingSessionRecordingApiUrl(
  authKey: string,
  gravityServerUrl: string,
  sessionId: string,
) {
  return `${trackingUrlStartPart(gravityServerUrl)}/${authKey}/record/${sessionId}`
}

export function buildGravityTrackingSessionCollectionSettingsApiUrl(authKey: string, gravityServerUrl: string) {
  return `${trackingUrlStartPart(gravityServerUrl)}/${authKey}/settings`
}

export function trackingUrlStartPart(gravityServerUrl: string) {
  return `${gravityServerUrl}/api/tracking`
}

export function buildGravityTrackingMonitorSessionApiUrl(authKey: string, gravityServerUrl: string, sessionId: string) {
  return `${trackingUrlStartPart(gravityServerUrl)}/${authKey}/monitor/${sessionId}`
}
