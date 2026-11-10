import type { ScrollParent } from "../parents";
import loopState from "./loopState";
import scrollParents from "./scrollParents";

function unobserve(scrollParent: ScrollParent): void {
    // the document element stays observed, its size changes when the content above any parent changes
    if (loopState.resizeObserver != null && scrollParent.element !== document.documentElement) {
        loopState.resizeObserver.unobserve(scrollParent.element);
    }
}

export default function deleteScrollParent(scrollParent: ScrollParent): void {
    if (scrollParents.delete(scrollParent)) {
        unobserve(scrollParent);
    }
}
