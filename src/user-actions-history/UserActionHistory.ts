import { UserAction } from '../types'

export default interface UserActionHistory {
  push: (userAction: UserAction) => void

  getLast: () => UserAction

  getUserActionsHistory: () => UserAction[]
}
