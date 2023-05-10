import { UserActionType } from '../types'
import location from '../utils/location'
import gravityDocument from '../utils/gravityDocument'
import viewport from '../utils/viewport'

export default function createAsyncRequest(pathname: string, method: string) {
  return {
    pathname,
    method,
    type: UserActionType.AsyncRequest,
    location: location(),
    document: gravityDocument(),
    recordedAt: new Date().toISOString(),
    viewportData: viewport(),
  }
}
