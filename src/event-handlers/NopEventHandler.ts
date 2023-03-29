import { IEventHandler } from '../types'

export default class NopEventHandler implements IEventHandler {
  handle(): void {}
}
