export const GRAVITY_SERVER_ADDRESS = 'https://api.gravity.smartesting.com'

export function buildGravityTrackingPublishApiUrl(authKey: string, collectorServerUrl: string) {
  return `${trackingUrlStartPart(collectorServerUrl)}/${authKey}/publish`
}

export function buildGravityTrackingIdentifySessionApiUrl(
  authKey: string,
  collectorServerUrl: string,
  sessionId: string,
) {
  return `${trackingUrlStartPart(collectorServerUrl)}/${authKey}/identify/${sessionId}`
}

export function buildGravityTrackingSessionRecordingApiUrl(
  authKey: string,
  collectorServerUrl: string,
  sessionId: string,
) {
  return `${trackingUrlStartPart(collectorServerUrl)}/${authKey}/record/${sessionId}`
}

export function buildGravityTrackingSessionCollectionSettingsApiUrl(authKey: string, gravityServerUrl: string) {
  return `${trackingUrlStartPart(gravityServerUrl)}/${authKey}/settings`
}

export function trackingUrlStartPart(gravityServerUrl: string) {
  return `${gravityServerUrl}/api/tracking`
}
