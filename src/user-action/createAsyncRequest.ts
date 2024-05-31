import { AsyncRequest, UserActionType } from '../types'
import location from '../utils/location'
import gravityDocument from '../utils/gravityDocument'
import viewport from '../utils/viewport'

export default function createAsyncRequest(url: string, method: string, windowInstance: Window): AsyncRequest {
  return {
    url,
    method,
    type: UserActionType.AsyncRequest,
    location: location(windowInstance),
    document: gravityDocument(windowInstance),
    recordedAt: new Date().toISOString(),
    viewportData: viewport(windowInstance),
  }
}
