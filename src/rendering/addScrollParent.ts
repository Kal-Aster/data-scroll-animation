import parents from "../parents";

import observe from "./observe";
import scrollParents from "./scrollParents";

export default function addScrollParent(scrollParent: parents.ScrollParent): void {
    scrollParents.add(scrollParent);
    observe(scrollParent);
}
