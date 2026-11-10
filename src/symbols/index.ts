import _SCROLL_OBJECT from "./SCROLL_OBJECT";
import _SCROLL_PARENT from "./SCROLL_PARENT";

namespace symbols {
    // the type keeps the identity of the symbol, otherwise it would be widened to symbol
    export const SCROLL_OBJECT: typeof _SCROLL_OBJECT = _SCROLL_OBJECT;
    export const SCROLL_PARENT: typeof _SCROLL_PARENT = _SCROLL_PARENT;
}

export default symbols;
