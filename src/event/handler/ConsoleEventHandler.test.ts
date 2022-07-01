import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockWindowLocation, mockWindowScreen } from "../../test-utils/mocks";
import { createSessionEvent } from "../event";
import { ConsoleEventHandler } from "./ConsoleEventHandler";

declare module "vitest" {
    export interface TestContext {
        actualDebug?: (message?: any, ...optionalParams: any[]) => void;
    }
}

describe("ConsoleEventHandler", () => {

    describe("run", () => {
        beforeEach((ctx) => {
            mockWindowLocation();
            mockWindowScreen();

            vi.useFakeTimers();
            vi.setSystemTime(Date.parse("2022-05-12"));

            ctx.actualDebug = console.debug;

            console.debug = vi.fn().mockImplementation(() => {
                return;
            });
        });

        afterEach((ctx) => {
            if (ctx.actualDebug) console.debug = ctx.actualDebug;
        });

        it("print event to debug console", () => {
            const consoleEventHandler = new ConsoleEventHandler("abcd", "aaa-111");
            const sessionEvent = createSessionEvent();
            consoleEventHandler.run(createSessionEvent());

            expect(console.debug).toBeCalledWith("[GL DEBUG]");
            expect(console.debug).toBeCalledWith("Session: ", "aaa-111");
            expect(console.debug).toBeCalledWith("authKey: ", "abcd");
            expect(console.debug).toBeCalledWith(sessionEvent);
        });

        it("print event with delay in simulation mode", () => {
            const maxDelay = 2000;
            const consoleEventHandler = new ConsoleEventHandler("abcd", "aaa-111", {
                simulation: true,
                maxDelay
            });
            const sessionEvent = createSessionEvent();
            consoleEventHandler.run(createSessionEvent());

            vi.advanceTimersByTime(maxDelay);

            expect(console.debug).toBeCalledWith("[GL DEBUG]");
            expect(console.debug).toBeCalledWith("Session: ", "aaa-111");
            expect(console.debug).toBeCalledWith("authKey: ", "abcd");
            expect(console.debug).toBeCalledWith(sessionEvent);
        });

        it("wait before print event with delay in simulation mode", () => {
            const consoleEventHandler = new ConsoleEventHandler("abcd", "aaa-111", {
                simulation: true,
                maxDelay: 10000
            });

            consoleEventHandler.run(createSessionEvent());

            expect(console.debug).toBeCalledTimes(0);
        });
    });
});
