import crossfetch from 'cross-fetch'
import { nop } from '../utils/nop'
import { buildGravityTrackingMonitorSessionApiUrl } from '../gravityEndPoints'
import { Metric } from 'web-vitals'

export interface AddWebVitalResponse {
  metric: Metric | null
  error: AddWebVitalError | null
}

export enum AddWebVitalError {
  accessDenied = 'no_access',
  collectionNotFound = 'collection_not_found',
  sessionNotFound = 'session_not_found',
  domainNotFound = 'domain_not_found',
  domainExpired = 'domain_expired',
  invalidField = 'invalid_field',
  incorrectSource = 'incorrect_source',
  notUUID = 'not_a_uuid',
}

export function defaultWebVitalSender(
  authKey: string,
  gravityServerUrl: string,
  successCallback: () => void = nop,
  errorCallback: (statusCode: number, reason: AddWebVitalError) => void = nop,
) {
  return async (sessionId: string, metric: Metric): Promise<AddWebVitalResponse> => {
    return await sendWebVital(authKey, gravityServerUrl, sessionId, metric, null, successCallback, errorCallback)
  }
}

export function debugWebVitalSender(maxDelay: number, output: (args: any) => void = console.log) {
  return (_sessionId: string, metric: Metric) => {
    if (maxDelay === 0) {
      printMetric(metric, output)
    }
    setTimeout(() => {
      printMetric(metric, output)
    }, Math.random() * maxDelay)
  }
}

function printMetric(metric: Metric, output: (args: any) => void) {
  output('[Gravity Logger (debug mode)]')
  output(`web vitals with ${JSON.stringify(metric)}`)
}

export async function sendWebVital(
  authKey: string,
  gravityServerUrl: string,
  sessionId: string,
  metric: Metric,
  source: string | null = null,
  successCallback: (metric: Metric) => void = nop,
  errorCallback: (statusCode: number, error: AddWebVitalError) => void = nop,
  fetch = crossfetch,
): Promise<AddWebVitalResponse> {
  const headers: any = {
    'Content-Type': 'application/json',
  }
  if (source !== null) {
    headers.Origin = source
  }
  const response = await fetch(buildGravityTrackingMonitorSessionApiUrl(authKey, gravityServerUrl, sessionId), {
    method: 'POST',
    body: JSON.stringify(metric),
    headers,
  })
  const addWebVitalResponse: AddWebVitalResponse = await response.json()
  if (response.status === 200 && addWebVitalResponse.metric !== null) {
    successCallback(addWebVitalResponse.metric)
  } else {
    addWebVitalResponse.error !== null && errorCallback(response.status, addWebVitalResponse.error)
  }
  return addWebVitalResponse
}
