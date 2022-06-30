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

        it("sends event to Gravity server", () => {
            const consoleEventHandler = new ConsoleEventHandler("abcd", "aaa-111");
            const sessionEvent = createSessionEvent();
            consoleEventHandler.run(createSessionEvent());

            expect(console.debug).toBeCalledWith("[GL DEBUG]");
            expect(console.debug).toBeCalledWith("Session: ", "aaa-111");
            expect(console.debug).toBeCalledWith("authKey: ", "abcd");
            expect(console.debug).toBeCalledWith(sessionEvent);
        });
    });
});
