import { UserAction } from '../types'

export default interface IUserActionHandler {
  handle: (action: UserAction) => void
}

export class NopUserActionHandler implements IUserActionHandler {
  handle(): void {}
}
