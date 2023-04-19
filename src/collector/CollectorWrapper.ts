import { createSessionStartedUserAction } from '../movement/createSessionStartedUserAction'
import { CollectorOptions, SessionStartedUserAction, SessionTraitValue } from '../types'
import MovementHandler from '../movement/MovementHandler'
import { debugMovements, defaultMovementSender } from '../movement/sessionMovementSender'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import MemoryMovementsHistory from '../movement-history/MemoryMovementsHistory'
import TestNameHandler from '../test-name-handler/TestNameHandler'
import SessionTraitHandler from '../session-trait/SessionTraitHandler'
import { debugSessionTraitSender, defaultSessionTraitSender } from '../session-trait/sessionTraitSender'
import { nop } from '../utils/nop'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import ClickEventListener from '../event-listeners/ClickEventListener'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import { config } from '../config'
import TrackingHandler from '../tracking-handler/TrackingHandler'
import { preventBadSessionTraitValue } from '../session-trait/checkSessionTraitValue'
import { TargetEventListenerOptions } from '../event-listeners/TargetedEventListener'
import MutationObserverHandler from '../mutation-observer-handler/MutationObserverHandler'
import { createDomMutations } from './dom-mutation/createDomMutation'

class CollectorWrapper {
  readonly userActionHandler: MovementHandler
  readonly movementsHistory: MemoryMovementsHistory
  readonly sessionTraitHandler: SessionTraitHandler
  readonly eventListenerHandler: EventListenersHandler
  readonly mutationObserverHandler: MutationObserverHandler
  readonly trackingHandler: TrackingHandler

  constructor(
    private readonly options: CollectorOptions,
    private readonly window: Window,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly testNameHandler: TestNameHandler,
  ) {
    this.trackingHandler = new TrackingHandler(config.ERRORS_TERMINATE_TRACKING)

    const movementOutput = options.debug
      ? debugMovements(options.maxDelay)
      : defaultMovementSender(
          options.authKey,
          options.gravityServerUrl,
          nop,
          this.trackingHandler.getSenderErrorCallback(),
        )

    const sessionTraitOutput = options.debug
      ? debugSessionTraitSender(options.maxDelay)
      : defaultSessionTraitSender(
          options.authKey,
          options.gravityServerUrl,
          nop,
          this.trackingHandler.getSenderErrorCallback(),
        )

    const isNewSession = !sessionIdHandler.isSet() || testNameHandler.isNewTest()
    testNameHandler.refresh()

    if (isNewSession) {
      this.trackingHandler.setActive(keepSession(options))
      sessionIdHandler.generateNewSessionId()
    }
    this.movementsHistory = new MemoryMovementsHistory()

    this.userActionHandler = new MovementHandler(
      sessionIdHandler,
      options.requestInterval,
      movementOutput,
      options.onPublish,
      this.movementsHistory,
    )

    this.sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, options.requestInterval, sessionTraitOutput)

    if (isNewSession) this.initSession(createSessionStartedUserAction())

    const targetedEventListenerOptions: TargetEventListenerOptions = {
      excludeRegex: options.excludeRegex,
      customSelector: options.customSelector,
    }

    this.eventListenerHandler = new EventListenersHandler([
      new ClickEventListener(this.userActionHandler, this.window, targetedEventListenerOptions),
      new KeyUpEventListener(this.userActionHandler, this.window, targetedEventListenerOptions),
      new KeyDownEventListener(
        this.userActionHandler,
        this.window,
        this.movementsHistory,
        targetedEventListenerOptions,
      ),
      new ChangeEventListener(this.userActionHandler, this.window, targetedEventListenerOptions),
      new BeforeUnloadEventListener(this.userActionHandler, this.window),
    ])

    const mutOptions: MutationObserverInit = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    }

    this.mutationObserverHandler = new MutationObserverHandler(
      new MutationObserver((muts) =>
        createDomMutations(muts).map(this.userActionHandler.handle.bind(this.userActionHandler)),
      ),
      mutOptions,
    )

    this.trackingHandler.init(this.eventListenerHandler, this.mutationObserverHandler)

    // // create a new MutationObserver object

    // var observer = new MutationObserver(function (mutations: MutationRecord[]) {
    //   // handle the mutations here
    //   for(let mutation of mutations) {
    //       console.log(mutation)
    //   }
    //   mutations.forEach(function(mutation) {
    //     if (mutation.type === "attributes" && mutation.attributeName === "value") {
    //       // loop through added nodes to find form fields
    //       mutation.addedNodes.forEach((node) => {
    //         if (
    //           node instanceof HTMLInputElement ||
    //           node instanceof HTMLSelectElement ||
    //           node instanceof HTMLTextAreaElement
    //         ) {
    //           // handle changes to form fields here
    //           console.log("Form field value changed: ", (node as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value);
    //         }
    //       });
    //     }
    //   });
    // })

    // // start observing changes to the DOM body
    // observer.observe(this.window.document.body, mutOptions)

    // const intObserver = new IntersectionObserver(entries => {
    //   entries.forEach(entry => {
    //     console.log(entry)
    //   })
    // })

    // intObserver.observe(this.window.document.body)

    // Listen for fetch requests
    // window.addEventListener('fetch', (event:FetchEvent) => {
    //   console.log('Fetch request:', event.request)
    // });
  }

  identifySession(traitName: string, traitValue: SessionTraitValue) {
    if (this.trackingHandler.isTracking() && preventBadSessionTraitValue(traitValue)) {
      this.sessionTraitHandler.handle(traitName, traitValue)
    }
  }

  private initSession(sessionStartedUserAction: SessionStartedUserAction) {
    if (this.trackingHandler.isTracking()) this.userActionHandler.handle(sessionStartedUserAction)
  }
}

export default CollectorWrapper

function keepSession(options: CollectorOptions): boolean {
  const keepSession = options.sessionsPercentageKept >= 100 * Math.random()
  const rejectSession = options.rejectSession()
  return keepSession && !rejectSession
}
