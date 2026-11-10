import type { ScrollParent } from "../parents";
import loopState from "./loopState";
import resizeObserverOptions from "./resizeObserverOptions";

export default function observe(scrollParent: ScrollParent): void {
    if (loopState.resizeObserver != null) {
        loopState.resizeObserver.observe(scrollParent.element, resizeObserverOptions);
    }
}
