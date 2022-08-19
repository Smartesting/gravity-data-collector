import { UserAction } from '../../types'

export default interface MemoryUserActionHandler {
  handle: (action: UserAction) => void

  flush: () => void
}
