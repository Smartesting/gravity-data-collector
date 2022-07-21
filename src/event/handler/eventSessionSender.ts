import { SessionEvent } from '../../types'
import fetch from 'cross-fetch'
import { nop } from '../../utils/nop'

export const GRAVITY_SERVER_ADDRESS = 'https://smartestinggravityserver.herokuapp.com' // TODO in a config file ?

export function buildGravityTrackingApiUrl(authKey: string) {
  return `${GRAVITY_SERVER_ADDRESS}/api/tracking/${authKey}/publish`
}

export function defaultEventSessionSender(
  authKey: string,
  successCallback: (payload: any) => void = nop,
  errorCallback: (reason: string) => void = nop): (sessionEvents: SessionEvent[]) => Promise<void> {
  return async (sessionEvents: SessionEvent[]) => await sendSessionEvents(authKey, sessionEvents, successCallback, errorCallback)
}

export function debugEventSessionSender(maxDelay: number, output: (args: any) => void = console.log) {
  return (sessionEvents: SessionEvent[]) => {
    if (maxDelay === 0) {
      printSessionEvents(sessionEvents, output)
    }
    setTimeout(() => {
      printSessionEvents(sessionEvents, output)
    }, Math.random() * maxDelay)
  }
}

function printSessionEvents(sessionEvents: SessionEvent[], output: (args: any) => void) {
  output('[Gravity Logger (debug mode)]')
  output(`${sessionEvents.length} session events: `)
  output(sessionEvents)
}

async function sendSessionEvents(
  authKey: string,
  sessionEvents: SessionEvent[],
  successCallback: (payload: any) => void,
  errorCallback: (reason: string) => void): Promise<void> {
  try {
    const response = await fetch(buildGravityTrackingApiUrl(authKey), {
      method: 'POST',
      body: JSON.stringify(sessionEvents),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 200) {
      successCallback(await response.json())
    } else {
      errorCallback(`error ${response.status}, ${response.statusText}`)
    }
  } catch (err: any) {
    errorCallback(err.message)
  }
}
