import { describe, it } from "vitest";
import { JSDOM } from "jsdom";
import IEventHandler from "../handler/IEventHandler";
import { fireEvent, getByRole, waitFor } from "@testing-library/dom";
import ClickEventListener from "./ClickEventListener";

describe("ClickEventListener", () => {

    it("calls listener when focus out event been fired", async () => {
        const dom = new JSDOM(`
                <div>
                    <button class="size-lg"/>
                </div>`);

        let runCalled: boolean = false;
        let eventHandler: IEventHandler = {
            run: () => {
                runCalled = true;
            }
        };

        new ClickEventListener(eventHandler, dom.window as unknown as Window).init();

        const container = dom.window.document.querySelector("div");
        const button = await waitFor(() => getByRole(container as HTMLElement, "button"));

        fireEvent.click(button);

        await waitFor(() => {
            if (!runCalled) throw new Error("Run has not been called");
        });
    });
});
