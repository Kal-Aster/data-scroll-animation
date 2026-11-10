import symbols from "../symbols";

import ScrollParent from "./ScrollParent";

let baseScrollParent: ScrollParent | null = null;

// parent of the elements without a data-scroll-parent ancestor: the whole document;
// it is created on the first use, so importing the library doesn't access the DOM
export default function getBaseScrollParent(): ScrollParent {
    if (baseScrollParent == null) {
        baseScrollParent = new ScrollParent(document.documentElement);
        document.body[symbols.SCROLL_PARENT] = baseScrollParent;
    }
    return baseScrollParent;
}
