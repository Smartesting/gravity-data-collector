export default class MutationObserverHandler {
  constructor(private readonly mutationObserver: MutationObserver, private readonly options: MutationObserverInit) {}

  initializeObserver() {
    this.mutationObserver.observe(document.body, this.options)
  }

  terminateObserver() {
    this.mutationObserver.disconnect()
  }
}
