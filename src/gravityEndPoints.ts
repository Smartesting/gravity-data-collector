export const GRAVITY_SERVER_ADDRESS = 'https://gravityclient-canary.herokuapp.com'

export function buildGravityTrackingPublishApiUrl(authKey: string, gravityServerUrl: string) {
  return `${gravityServerUrl}/api/tracking/${authKey}/publish`
}

export function buildGravityTrackingIdentifySessionApiUrl(
  authKey: string,
  gravityServerUrl: string,
  sessionId: string,
) {
  return `${gravityServerUrl}/api/tracking/${authKey}/identify/${sessionId}`
}
