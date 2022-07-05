import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import FocusOutEventListener from "./FocusOutEventListener";
import IEventHandler from "../handler/IEventHandler";
import { fireEvent, getByRole, waitFor } from "@testing-library/dom";
import sinon from "sinon";

describe("FocusOutEventListener", () => {

    describe("listener", () => {

        let eventHandler: IEventHandler;
        let runSpy: sinon.SinonSpy;

        beforeEach(() => {
                eventHandler = {
                    run: () => {
                    }
                };
                runSpy = sinon.spy(eventHandler, "run");
            }
        );

        afterEach(() => {
            runSpy.restore();
        });

        it("calls listener when focus out event been fired", async () => {
            const dom = new JSDOM(`
                <div>
                    <input type="text" class="size-lg"/>
                </div>`);

            new FocusOutEventListener(eventHandler, dom.window as unknown as Window).init();

            const container = dom.window.document.querySelector("div");
            const input = await waitFor(() => getByRole(container as HTMLElement, "textbox"));

            fireEvent.focusOut(input);

            await waitFor(() => {
                expect(runSpy.calledOnce).toBeTruthy();
            });
        });

        it("does not call listener if target is checkbox", async () => {
            const dom = new JSDOM(`
                <div>
                    <input type="text" class="size-lg"/>
                </div>`);

            const listener = new FocusOutEventListener(eventHandler, dom.window as unknown as Window);
            const listenerSpy = sinon.spy(listener, "listener");

            listener.init();

            const container = dom.window.document.querySelector("div");
            const input = await waitFor(() => getByRole(container as HTMLElement, "textbox"));

            fireEvent.focusOut(input);

            await waitFor(() => {
                expect(listenerSpy.calledOnce).toBeTruthy();
                expect(runSpy.notCalled).toBeTruthy();
            });
        });
    });
});
