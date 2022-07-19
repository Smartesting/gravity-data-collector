export const GRAVITY_SERVER_ADDRESS = 'https://smartestinggravityserver.herokuapp.com'

export function buildGravityTrackingApiUrl(authKey: string) {
  return `${GRAVITY_SERVER_ADDRESS}/api/tracking/${authKey}/publish`
}
