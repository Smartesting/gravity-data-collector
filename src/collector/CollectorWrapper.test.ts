import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockWindowLocation, mockWindowScreen } from "../test-utils/mocks";
import ClickEventListener from "../eventListener/ClickEventListener";
import FocusOutEventListener from "../eventListener/FocusOutEventListener";
import { ConsoleEventHandler } from "../eventHandler/ConsoleEventHandler";
import GravityEventHandler from "../eventHandler/GravityEventHandler";
import CollectorWrapper from "./CollectorWrapper";
import { createSessionEvent } from "../event/event";

describe("CollectorWrapper", () => {
    beforeEach(() => {
        mockWindowScreen();
        mockWindowLocation();
        vi.spyOn(GravityEventHandler.prototype, "run").mockImplementation(() => {
            return {};
        });
    });

    describe("constructor", () => {
        it("instantiates a GravityEventHandler by default", () => {
            const sut = new CollectorWrapper("abcd");
            expect(sut.eventHandler).toBeInstanceOf(GravityEventHandler);
        });

        it("instantiates a ConsoleEventHandler when options.debug", () => {
            vi.spyOn(ConsoleEventHandler.prototype, "run").mockImplementation(() => {
                return {};
            });
            const sut = new CollectorWrapper("abcd", { baseUrl: "localhost", debug: true });
            expect(sut.eventHandler).toBeInstanceOf(ConsoleEventHandler);
        });

        it("a \"sessionStarted\" event is sent when initialized", () => {
            Date.parse("2022-05-12");
            vi.useFakeTimers();
            vi.setSystemTime(Date.parse("2022-05-12"));

            const expectedEvent = createSessionEvent();

            const mock = vi.spyOn(GravityEventHandler.prototype, "run")
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
