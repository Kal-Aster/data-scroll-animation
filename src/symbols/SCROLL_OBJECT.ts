import type { ScrollObject } from "../elements";

const SCROLL_OBJECT: unique symbol = Symbol("scroll-object");

declare global {
    /* tslint:disable-next-line:interface-name */
    interface HTMLElement {
        [SCROLL_OBJECT]: ScrollObject | undefined;
    }
}

export default SCROLL_OBJECT;
