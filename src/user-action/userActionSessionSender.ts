import { SessionUserAction } from '../types'
import fetch from 'cross-fetch'
import { nop } from '../utils/nop'

export const GRAVITY_SERVER_ADDRESS = 'https://smartestinggravityserver.herokuapp.com'

export function buildGravityTrackingApiUrl(authKey: string, gravityServerUrl: string) {
  return `${gravityServerUrl}/api/tracking/${authKey}/publish`
}

export function defaultUserActionSessionSender(
  authKey: string,
  gravityServerUrl: string,
  successCallback: (payload: any) => void = nop,
  errorCallback: (reason: string) => void = nop,
): (sessionActions: SessionUserAction[]) => Promise<void> {
  return async (sessionActions: SessionUserAction[]) =>
    await sendSessionUserActions(authKey, gravityServerUrl, sessionActions, successCallback, errorCallback)
}

export function debugUserActionSessionSender(maxDelay: number, output: (args: any) => void = console.log) {
  return (sessionActions: SessionUserAction[]) => {
    if (maxDelay === 0) {
      printSessionUserActions(sessionActions, output)
    }
    setTimeout(() => {
      printSessionUserActions(sessionActions, output)
    }, Math.random() * maxDelay)
  }
}

function printSessionUserActions(sessionActions: SessionUserAction[], output: (args: any) => void) {
  output('[Gravity Logger (debug mode)]')
  output(`${sessionActions.length} session user actions: `)
  output(sessionActions)
}

export async function sendSessionUserActions(
  authKey: string,
  gravityServerUrl: string,
  sessionActions: SessionUserAction[],
  successCallback: (payload: any) => void,
  errorCallback: (reason: string) => void,
): Promise<any> {
  try {
    const response = await fetch(buildGravityTrackingApiUrl(authKey, gravityServerUrl), {
      method: 'POST',
      body: JSON.stringify(sessionActions),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.status === 200) {
      console.log(`${sessionActions.length} session user actions successfully sent to Gravity Server`)
      successCallback(await response.json())
    } else {
      errorCallback(`error ${response.status}, ${response.statusText}`)
    }
    return await response.json()
  } catch (err: any) {
    errorCallback(err.message)
  }
}
