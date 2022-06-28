import TLogHandler from "../log-handlers/TLogHandler";
import createGravityEvent from "../../utils/createGravityEvent";
import EventType from "../../utils/eventType";

class ClickEventHandler {
  private logHandler: TLogHandler

  constructor(logHandler: TLogHandler) {
    this.logHandler = logHandler
  }

  init() {
    window.addEventListener('click', async (event) => {
      this.logHandler.run(await createGravityEvent(event, EventType.Click))
    }, true)
  }
}

export default ClickEventHandler