import { SessionUserAction, UserAction } from '../types'

export function toSessionUserAction(action: UserAction, sessionId: string): SessionUserAction {
  return {
    sessionId,
    ...action,
  }
}
