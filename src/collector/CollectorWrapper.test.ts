import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockWindowLocation, mockWindowScreen } from "../test-utils/mocks";
import ClickEventListener from "../event/listener/ClickEventListener";
import FocusOutEventListener from "../event/listener/FocusOutEventListener";
import { ConsoleEventHandler } from "../event/handler/ConsoleEventHandler";
import CollectorWrapper from "./CollectorWrapper";
import { createSessionEvent } from "../event/event";

describe("CollectorWrapper", () => {
    beforeEach(() => {
        mockWindowScreen();
        mockWindowLocation();
        vi.spyOn(ConsoleEventHandler.prototype, "run").mockImplementation(() => {
            return {};
        });
    });

    describe("constructor", () => {
        it("instantiates a ConsoleEventHandler by default", () => {
            const sut = new CollectorWrapper("abcd");
            expect(sut.eventHandler).toBeInstanceOf(ConsoleEventHandler);
        });

        it("a \"sessionStarted\" event is sent when initialized", () => {
            Date.parse("2022-05-12");
            vi.useFakeTimers();
            vi.setSystemTime(Date.parse("2022-05-12"));

            const expectedEvent = createSessionEvent();

            const mock = vi.spyOn(ConsoleEventHandler.prototype, "run")
                .mockImplementation(() => {
                    return {};
                });

            new CollectorWrapper("abcd");
            expect(mock).toHaveBeenCalledWith(expectedEvent);
        });

        it("initializes ClickEventHandler", () => {
            vi.spyOn(ClickEventListener.prototype, "init").mockImplementation(() => {
                return {};
            });
            new CollectorWrapper("abcd");

            expect(ClickEventListener.prototype.init).toHaveBeenCalledOnce();
        });

        it("initializes FocusOutEventHandler", () => {
            vi.spyOn(FocusOutEventListener.prototype, "init").mockImplementation(() => {
                return {};
            });
            new CollectorWrapper("abcd");

            expect(FocusOutEventListener.prototype.init).toHaveBeenCalledOnce();
        });
    });
});
