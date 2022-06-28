import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockWindowLocation, mockWindowScreen } from "../test-utils/mocks";
import { createSessionEvent } from "../utils/createSessionEvent";
import ClickEventHandler from "./event-handlers/ClickEventHandler";
import FocusOutEventHandler from "./event-handlers/FocusOutEventHandler";
import {DebuggerLogHandler} from "./log-handlers/toDebug";
import GravityLogHandler from "./log-handlers/toGravity";
import CollectorWrapper from "./CollectorWrapper";


describe('CollectorWrapper', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    vi.spyOn(GravityLogHandler.prototype, 'run').mockImplementation((log: Log) => { return {}})
  })

  describe('constructor', ()=> {
    it('instantiates a GravityLogHandler by default', () => {
      const sut = new CollectorWrapper("abcd")
      expect(sut.logHandler).toBeInstanceOf(GravityLogHandler)
    })

    it('instantiates a DebugLogHandler when options.debug', () => {
      vi.spyOn(DebuggerLogHandler.prototype, 'run').mockImplementation(() => { return {}})
      const sut = new CollectorWrapper("abcd", {baseUrl: 'localhost', debug: true})
      expect(sut.logHandler).toBeInstanceOf(DebuggerLogHandler)
    })

    it('a "sessionStarted" event is sent when initialized', () => {
      Date.parse('2022-05-12')
      vi.useFakeTimers()
      vi.setSystemTime(Date.parse('2022-05-12'))

      const expectedEvent = createSessionEvent()

      const mock = vi.spyOn(GravityLogHandler.prototype, 'run')
        .mockImplementation((log: Log) => { return {}})

      new CollectorWrapper("abcd")
      expect(mock).toHaveBeenCalledWith(expectedEvent)
    })

    it('initializes ClickEventHandler', () => {
      vi.spyOn(ClickEventHandler.prototype, 'init').mockImplementation(() => { return {}})
      new CollectorWrapper("abcd")

      expect(ClickEventHandler.prototype.init).toHaveBeenCalledOnce()
    })

    it('initializes FocusOutEventHandler', () => {
      vi.spyOn(FocusOutEventHandler.prototype, 'init').mockImplementation(() => {return {}})
      new CollectorWrapper("abcd")

      expect(FocusOutEventHandler.prototype.init).toHaveBeenCalledOnce()
    })
  })
})
