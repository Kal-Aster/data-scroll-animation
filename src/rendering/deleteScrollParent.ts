import parents from "../parents";

import loopState from "./loopState";
import scrollParents from "./scrollParents";

function unobserve(scrollParent: parents.ScrollParent): void {
    // the document element stays observed, its size changes when the content above any parent changes
    if (loopState.resizeObserver != null && scrollParent.element !== document.documentElement) {
        loopState.resizeObserver.unobserve(scrollParent.element);
    }
}

export default function deleteScrollParent(scrollParent: parents.ScrollParent): void {
    if (scrollParents.delete(scrollParent)) {
        unobserve(scrollParent);
    }
}
