import SCROLL_OBJECTDefault from "./SCROLL_OBJECT";
import SCROLL_PARENTDefault from "./SCROLL_PARENT";

namespace symbols {
    // the type keeps the identity of the symbol, otherwise it would be widened to symbol
    export const SCROLL_OBJECT: typeof SCROLL_OBJECTDefault = SCROLL_OBJECTDefault;
    export const SCROLL_PARENT: typeof SCROLL_PARENTDefault = SCROLL_PARENTDefault;
}

export default symbols;
