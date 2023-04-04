import { AddSessionEventsError, AddSessionEventsResponse, SessionEvent } from '../types'
import crossfetch from 'cross-fetch'
import { nop } from '../utils/nop'
import { buildGravityEventTrackingApiUrl } from '../gravityEndPoints'

export function defaultSessionEventSender(
  authKey: string,
  gravityServerUrl: string,
  successCallback: (payload: any) => void = nop,
  errorCallback: (statusCode: number, reason: AddSessionEventsError) => void = nop,
) {
  return async (sessionEvents: readonly SessionEvent[]): Promise<AddSessionEventsResponse> => {
    return await sendSessionEvents(authKey, gravityServerUrl, sessionEvents, null, successCallback, errorCallback)
  }
}

export function debugSessionEventSender(output: (args: any) => void = console.log) {
  return (events: readonly SessionEvent[]) => {
    printSessionEvents(events, output)
  }
}

function printSessionEvents(sessionEvents: readonly SessionEvent[], output: (args: any) => void) {
  output(`${sessionEvents.length} session events: `)
  output(sessionEvents)
}

export async function sendSessionEvents(
  authKey: string,
  gravityServerUrl: string,
  sessionEvents: readonly SessionEvent[],
  source: string | null = null,
  successCallback: (payload: any) => void = nop,
  errorCallback: (statusCode: number, reason: AddSessionEventsError) => void = nop,
  fetch = crossfetch,
): Promise<AddSessionEventsResponse> {
  const headers: any = {
    'Content-Type': 'application/json',
  }
  if (source !== null) {
    headers.Origin = source
  }
  const response = await fetch(buildGravityEventTrackingApiUrl(authKey, gravityServerUrl), {
    method: 'POST',
    body: JSON.stringify(sessionEvents),
    headers,
  })
  const addSessionEventsResponse = await response.json()
  if (response.status === 200) {
    successCallback(addSessionEventsResponse)
  } else {
    errorCallback(response.status, addSessionEventsResponse.error)
  }
  return addSessionEventsResponse
}
