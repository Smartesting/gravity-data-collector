import crossfetch from 'cross-fetch'
import { nop } from '../utils/nop'
import { buildGravityTrackingIdentifySessionApiUrl } from '../gravityEndPoints'
import { SessionTraits } from '../types'

export interface IdentifySessionResponse {
  error: IdentifySessionError | null
}

export enum IdentifySessionError {
  accessDenied = 'no_access',
  collectionNotFound = 'collection_not_found',
  sessionNotFound = 'session_not_found',
  invalidField = 'invalid_field',
  incorrectSource = 'incorrect_source',
  notUUID = 'not_a_uuid',
  projectNotFound = 'project_not_found',
  projectExpired = 'project_expired',

  /** @deprecated Use projectNotFound instead. */
  domainNotFound = 'domain_not_found',
  /** @deprecated Use projectExpired instead. */
  domainExpired = 'domain_expired',
}

export function defaultSessionTraitSender(
  authKey: string,
  gravityServerUrl: string,
  successCallback: () => void = nop,
  errorCallback: (statusCode: number, reason: IdentifySessionError) => void = nop,
) {
  return async (sessionId: string, traits: SessionTraits): Promise<IdentifySessionResponse> => {
    return await sendSessionTraits(authKey, gravityServerUrl, sessionId, traits, null, successCallback, errorCallback)
  }
}

export function debugSessionTraitSender(maxDelay: number, output: (args: any) => void = console.log) {
  return (_sessionId: string, traits: SessionTraits) => {
    if (maxDelay === 0) {
      printTraits(traits, output)
    }
    setTimeout(() => {
      printTraits(traits, output)
    }, Math.random() * maxDelay)
  }
}

function printTraits(traits: SessionTraits, output: (args: any) => void) {
  output('[Gravity Logger (debug mode)]')
  output(`identify session with ${JSON.stringify(traits)}`)
}

export async function sendSessionTraits(
  authKey: string,
  gravityServerUrl: string,
  sessionId: string,
  sessionTraits: SessionTraits,
  source: string | null = null,
  successCallback: () => void = nop,
  errorCallback: (statusCode: number, error: IdentifySessionError) => void = nop,
  fetch = crossfetch,
): Promise<IdentifySessionResponse> {
  const headers: any = {
    'Content-Type': 'application/json',
  }
  if (source !== null) {
    headers.Origin = source
  }
  const response = await fetch(buildGravityTrackingIdentifySessionApiUrl(authKey, gravityServerUrl, sessionId), {
    method: 'POST',
    body: JSON.stringify(sessionTraits),
    redirect: 'follow',
    headers,
  })
  const identifySessionResponse: IdentifySessionResponse = await response.json()
  if (response.status === 200) {
    successCallback()
  } else {
    identifySessionResponse.error !== null && errorCallback(response.status, identifySessionResponse.error)
  }
  return identifySessionResponse
}
