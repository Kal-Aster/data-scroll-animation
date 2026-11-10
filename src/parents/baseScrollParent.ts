import symbols from "../symbols";

import ScrollParent from "./ScrollParent";

// parent of the elements without a data-scroll-parent ancestor: the whole document
const baseScrollParent: ScrollParent = new ScrollParent(document.documentElement);
document.body[symbols.SCROLL_PARENT] = baseScrollParent;

export default baseScrollParent;
