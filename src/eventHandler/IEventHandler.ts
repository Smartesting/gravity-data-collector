import { TEvent } from "../types";

export default interface IEventHandler {
    run: (event: TEvent) => void;
}
