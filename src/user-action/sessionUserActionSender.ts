import { SessionUserAction } from '../types'
import crossfetch from 'cross-fetch'
import { nop } from '../utils/nop'
import { buildGravityTrackingPublishApiUrl } from '../gravityEndPoints'

export interface AddSessionUserActionsResponse {
  error: AddSessionUserActionsError | null
}

export enum AddSessionUserActionsError {
  incorrectSource = 'incorrect_source',
  conflict = 'conflict',
  notUUID = 'not_a_uuid',
  collectionNotFound = 'collection_not_found',
  domainNotFound = 'domain_not_found',
  domainExpired = 'domain_expired',
  invalidFormat = 'invalid_format',
}

export function defaultSessionUserActionSender(
  authKey: string,
  gravityServerUrl: string,
  successCallback: (payload: any) => void = nop,
  errorCallback: (statusCode: number, reason: AddSessionUserActionsError) => void = nop,
) {
  return async (sessionActions: SessionUserAction[]) => {
    return await batchPromises<SessionUserAction>(
      sessionActions,
      50,
      async (input) =>
        await sendSessionUserActions(authKey, gravityServerUrl, input, null, successCallback, errorCallback),
    )
  }
}

export function debugSessionUserActionSender(maxDelay: number, output: (args: any) => void = console.log) {
  return (sessionActions: SessionUserAction[]) => {
    if (maxDelay === 0) {
      printSessionUserActions(sessionActions, output)
    } else {
      setTimeout(() => {
        printSessionUserActions(sessionActions, output)
      }, Math.random() * maxDelay)
    }
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
  sessionActions: readonly SessionUserAction[],
  source: string | null = null,
  successCallback: (payload: any) => void = nop,
  errorCallback: (statusCode: number, reason: AddSessionUserActionsError) => void = nop,
  fetch = crossfetch,
): Promise<AddSessionUserActionsResponse> {
  const headers: any = {
    'Content-Type': 'application/json',
  }
  if (source !== null) {
    headers.Origin = source
  }
  const response = await fetch(buildGravityTrackingPublishApiUrl(authKey, gravityServerUrl), {
    method: 'POST',
    body: JSON.stringify(sessionActions),
    redirect: 'follow',
    headers,
  })
  const addSessionUserActionsResponse = await response.json()
  if (response.status === 200) {
    successCallback(addSessionUserActionsResponse)
  } else {
    errorCallback(response.status, addSessionUserActionsResponse.error)
  }
  return addSessionUserActionsResponse
}

async function batchPromises<Input>(
  input: readonly Input[],
  batchSize: number,
  callBack: (input: readonly Input[]) => unknown,
) {
  if (batchSize < 1) throw new Error('batch size cannot be lower than 1')
  let counter = 0
  while (counter < input.length) {
    await callBack(input.slice(counter, counter + batchSize))
    counter += batchSize
  }
}
