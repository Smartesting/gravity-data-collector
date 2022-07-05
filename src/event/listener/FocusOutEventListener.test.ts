import { describe, it } from "vitest";
import { JSDOM } from "jsdom";
import FocusOutEventListener from "./FocusOutEventListener";
import IEventHandler from "../handler/IEventHandler";
import { fireEvent, getByRole, waitFor } from "@testing-library/dom";

describe("event", () => {

    describe("FocusOutEventListener", () => {

        it("calls listener when focus out event been fired", async () => {
            const dom = new JSDOM(`
                <div>
                    <input type="text" class="size-lg"/>
                    <button class="size-lg"/>
                </div>`);

            let runCalled: boolean = false;
            let eventHandler: IEventHandler = {
                run: () => {
                    runCalled = true;
                }
            };

            new FocusOutEventListener(eventHandler, dom.window as unknown as Window).init();

            const container = dom.window.document.querySelector("div");
            const input = await waitFor(() => getByRole(container as HTMLElement, "textbox"));
            const button = await waitFor(() => getByRole(container as HTMLElement, "button"));

            fireEvent.click(input);
            fireEvent.click(button);

            await waitFor(() => {
                if (!runCalled) throw new Error("Run has not been called");
            });
        });
    });
});
