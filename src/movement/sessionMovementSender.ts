import { SessionMovement } from '../types'
import crossfetch from 'cross-fetch'
import { nop } from '../utils/nop'
import { buildGravityTrackingPublishApiUrl } from '../gravityEndPoints'

export interface AddMovementsResponse {
  error: AddMovementsError | null
}

export enum AddMovementsError {
  incorrectSource = 'incorrect_source',
  conflict = 'conflict',
  notUUID = 'not_a_uuid',
  collectionNotFound = 'collection_not_found',
  domainNotFound = 'domain_not_found',
  domainExpired = 'domain_expired',
  invalidFormat = 'invalid_format',
}

export function defaultMovementSender(
  authKey: string,
  gravityServerUrl: string,
  successCallback: (payload: any) => void = nop,
  errorCallback: (statusCode: number, reason: AddMovementsError) => void = nop,
) {
  return async (sessionActions: SessionMovement[]): Promise<AddMovementsResponse> => {
    return await sendMovements(authKey, gravityServerUrl, sessionActions, null, successCallback, errorCallback)
  }
}

export function debugMovements(maxDelay: number, output: (args: any) => void = console.log) {
  return (movements: SessionMovement[]) => {
    if (maxDelay === 0) {
      printMovements(movements, output)
    } else {
      setTimeout(() => {
        printMovements(movements, output)
      }, Math.random() * maxDelay)
    }
  }
}

function printMovements(movements: SessionMovement[], output: (args: any) => void) {
  output('[Gravity Logger (debug mode)]')
  output(`${movements.length} Movements: `)
  output(movements)
}

export async function sendMovements(
  authKey: string,
  gravityServerUrl: string,
  movements: SessionMovement[],
  source: string | null = null,
  successCallback: (payload: any) => void = nop,
  errorCallback: (statusCode: number, reason: AddMovementsError) => void = nop,
  fetch = crossfetch,
): Promise<AddMovementsResponse> {
  const headers: any = {
    'Content-Type': 'application/json',
  }
  if (source !== null) {
    headers.Origin = source
  }
  const response = await fetch(buildGravityTrackingPublishApiUrl(authKey, gravityServerUrl), {
    method: 'POST',
    body: JSON.stringify(movements),
    headers,
  })
  const addMovementsResponse = await response.json()
  if (response.status === 200) {
    successCallback(addMovementsResponse)
  } else {
    errorCallback(response.status, addMovementsResponse.error)
  }
  return addMovementsResponse
}
