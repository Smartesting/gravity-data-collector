import crossfetch from 'cross-fetch'
import { nop } from '../utils/nop'
import { buildGravityTrackingIdentifySessionApiUrl } from '../gravityEndPoints'
import { Traits } from './SessionTraitHandler'

export function defaultSessionTraitSender(
  authKey: string,
  gravityServerUrl: string,
  successCallback: (payload: any) => void = nop,
  errorCallback: (reason: string) => void = nop,
) {
  return async (sessionId: string, traits: Traits) => {
    await sendSessionTraits(authKey, gravityServerUrl, sessionId, traits, null, successCallback, errorCallback)
  }
}

export function debugSessionTraitSender(maxDelay: number, output: (args: any) => void = console.log) {
  return (_sessionId: string, traits: Traits) => {
    if (maxDelay === 0) {
      printTraits(traits, output)
    }
    setTimeout(() => {
      printTraits(traits, output)
    }, Math.random() * maxDelay)
  }
}

function printTraits(traits: Traits, output: (args: any) => void) {
  output('[Gravity Logger (debug mode)]')
  output(`identify session with ${JSON.stringify(traits)}`)
}

export async function sendSessionTraits(
  authKey: string,
  gravityServerUrl: string,
  sessionId: string,
  traits: Traits,
  source: string | null = null,
  successCallback: (payload: any) => void = nop,
  errorCallback: (reason: string) => void = nop,
  fetch = crossfetch,
) {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    }
    if (source !== null) {
      headers.Origin = source
    }
    const response = await fetch(buildGravityTrackingIdentifySessionApiUrl(authKey, gravityServerUrl, sessionId), {
      method: 'POST',
      body: JSON.stringify(traits),
      headers,
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
