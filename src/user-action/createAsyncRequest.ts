import { AsyncRequest, UserActionType } from '../types'
import gravityLocation from '../utils/gravityLocation'
import gravityDocument from '../utils/gravityDocument'
import viewport from '../utils/viewport'

export default function createAsyncRequest(url: string, method: string, windowInstance: Window): AsyncRequest {
  return {
    url,
    method,
    type: UserActionType.AsyncRequest,
    location: gravityLocation(windowInstance.location),
    document: gravityDocument(windowInstance.document),
    recordedAt: new Date().toISOString(),
    viewportData: viewport(windowInstance),
  }
}
