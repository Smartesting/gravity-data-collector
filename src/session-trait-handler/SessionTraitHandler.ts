import { TraitValue } from '../types'
import crossfetch from 'cross-fetch'
import { nop } from '../utils/nop'
import { buildGravityTrackingIdentifySessionApiUrl } from '../gravityEndPoints'

export type SessionTraitHandler = (traitName: string, traitValue: TraitValue) => void

export function defaultSessionTraitHandler(
  authKey: string,
  gravityServerUrl: string,
  sessionId: string,
  source: string | null = null,
  successCallback: (payload: any) => void = nop,
  errorCallback: (reason: string) => void = nop,
): SessionTraitHandler {
  return (traitName: string, traitValue: TraitValue): void => {
    void (async () => {
      await sendSessionTrait(
        authKey,
        gravityServerUrl,
        sessionId,
        traitName,
        traitValue,
        source,
        successCallback,
        errorCallback,
      )
    })()
  }
}

export function debugSessionTraitHandler(output: (args: any) => void = console.log): SessionTraitHandler {
  return (traitName: string, traitValue: TraitValue): void => {
    output('[Gravity Logger (debug mode)]')
    output(`identify session with ${traitName} = ${JSON.stringify(traitValue)}`)
  }
}

export async function sendSessionTrait(
  authKey: string,
  gravityServerUrl: string,
  sessionId: string,
  traitName: string,
  traitValue: TraitValue,
  source: string | null = null,
  successCallback: (payload: any) => void = nop,
  errorCallback: (reason: string) => void = nop,
  fetch = crossfetch,
) {
  try {
    const body: any = {}
    body[traitName] = traitValue
    const headers: any = {
      'Content-Type': 'application/json',
    }
    if (source !== null) {
      headers.Origin = source
    }
    const response = await fetch(buildGravityTrackingIdentifySessionApiUrl(authKey, gravityServerUrl, sessionId), {
      method: 'POST',
      body: JSON.stringify(body),
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
