import { IEventListener } from '../event-listeners-handler/IEventListener'
import { EventProvider, EventProviderKey } from '../types'

export class MochaListener implements IEventListener {
  private readonly provider: EventProvider
  private readonly listener: (...values: any[]) => void

  constructor(private readonly mochaRunner: Mocha.Runner, private readonly mochaEvent: string) {
    this.provider = { id: EventProviderKey.MOCHA, version: 'FIXME' } // FIXME
    this.listener = (command: any) => {
      // TODO on ne passe jamais là :-(, pourquoi ?
      console.log('MOCHA', mochaEvent, command)
    }
  }

  init(): void {
    this.mochaRunner.addListener(this.mochaEvent, this.listener)
  }

  terminate(): void {
    this.mochaRunner.removeListener(this.mochaEvent, this.listener)
  }
}
