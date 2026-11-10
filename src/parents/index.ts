import baseScrollParentDefault from "./baseScrollParent";
import ScrollParentDefault from "./ScrollParent";

namespace parents {
    export const baseScrollParent = baseScrollParentDefault;
    // classes are values and types: both are exported
    export const ScrollParent = ScrollParentDefault;
    export type ScrollParent = ScrollParentDefault;
}

export default parents;
