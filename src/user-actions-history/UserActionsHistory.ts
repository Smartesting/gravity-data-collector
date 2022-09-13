import { UserAction } from '../types'

export default interface UserActionsHistory {
  push: (userAction: UserAction) => void

  getLast: () => UserAction

  getUserActionsHistory: () => UserAction[]
}
