import { AsyncRequest, UserActionType } from '../types'
import location from '../utils/location'
import gravityDocument from '../utils/gravityDocument'
import viewport from '../utils/viewport'

export default function createAsyncRequest(url: string, method: string): AsyncRequest {
  return {
    url,
    method,
    type: UserActionType.AsyncRequest,
    location: location(),
    document: gravityDocument(),
    recordedAt: new Date().toISOString(),
    viewportData: viewport(),
  }
}
