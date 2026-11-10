import type { ScrollParent } from "../parents";

const SCROLL_PARENT: unique symbol = Symbol("scroll-parent");

declare global {
    /* tslint:disable-next-line:interface-name */
    interface HTMLElement {
        [SCROLL_PARENT]: ScrollParent | undefined;
    }
}

export default SCROLL_PARENT;
