import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockWindowLocation, mockWindowScreen } from "../test-utils/mocks";
import GravityEventHandler from "./GravityEventHandler";
import { createSessionEvent } from "../event/event";

declare module "vitest" {
    export interface TestContext {
        actualFetch?: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
    }
}

describe("GravityEventHandler", () => {
    describe("constructor", () => {
        it("default server url to Gravity production environment", () => {
            const sut = new GravityEventHandler("abcd", "aaa-111");
            expect(sut.serverUrl).toEqual(sut.DEFAULT_SERVER_BASE_URL + "/gravitylogger/savelog");
        });
    });

    describe("run", () => {
        beforeEach((ctx) => {
            mockWindowLocation();
            mockWindowScreen();

            vi.useFakeTimers();
            vi.setSystemTime(Date.parse("2022-05-12"));

            ctx.actualFetch = global.fetch;

            global.fetch = vi.fn().mockImplementation(() => {
                Promise.resolve({
                    json: () => Promise.resolve()
                });
            });
        });

        afterEach((ctx) => {
            if (ctx.actualFetch) global.fetch = ctx.actualFetch;
        });

        it("sends event to Gravity server", () => {
            const sut = new GravityEventHandler("abcd", "aaa-111");
            const sessionEvent = createSessionEvent();
            sut.run(createSessionEvent());

            const expectedURL = sut.DEFAULT_SERVER_BASE_URL + "/gravitylogger/savelog";
            const expectedData = {
                body: JSON.stringify(sessionEvent),
                headers: {
                    "Content-Type": "application/json",
                    "x-gravity-auth-key": "abcd",
                    "x-gravity-session": "aaa-111"
                },
                method: "POST"
            };
            expect(global.fetch).toBeCalledWith(expectedURL, expectedData);
        });

        it("sends a batch of events if the option is set", () => {
            const sut = new GravityEventHandler("abcd", "aaa-111", undefined, true);
            const sessionEvent = createSessionEvent();
            sut.run(createSessionEvent());

            const expectedURL = sut.DEFAULT_SERVER_BASE_URL + "/gravitylogger/savelog";
            const expectedData = {
                body: JSON.stringify([sessionEvent]),
                headers: {
                    "Content-Type": "application/json",
                    "x-gravity-auth-key": "abcd",
                    "x-gravity-session": "aaa-111"
                },
                method: "POST"
            };
            expect(global.fetch).toBeCalledWith(expectedURL, expectedData);
        });
    });
});
