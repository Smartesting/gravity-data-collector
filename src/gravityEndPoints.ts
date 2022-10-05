export const GRAVITY_SERVER_ADDRESS = 'https://smartestinggravityserver.herokuapp.com'

export function buildGravityTrackingPublishApiUrl(authKey: string, gravityServerUrl: string) {
  return `${gravityServerUrl}/api/tracking/${authKey}/publish`
}

export function buildGravityTrackingIdentifySessionApiUrl(authKey: string, gravityServerUrl: string, sessionId:string) {
  return `${gravityServerUrl}/api/tracking/${authKey}/identify/${sessionId}`
}
