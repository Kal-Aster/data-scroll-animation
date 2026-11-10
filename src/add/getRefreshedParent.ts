import { ScrollParent } from "../parents";
import { addScrollParent } from "../rendering";
import { SCROLL_PARENT } from "../symbols";

export default function getRefreshedParent(element: HTMLElement): ScrollParent {
    // an animated element stores the parent it belongs to, which is an ancestor's:
    // reuse it only if it is the element's own
    if (element[SCROLL_PARENT] && element[SCROLL_PARENT]!.element === element) {
        return element[SCROLL_PARENT]!.refresh();
    }
    const parent = new ScrollParent(element);
    addScrollParent(parent);
    return parent;
}
