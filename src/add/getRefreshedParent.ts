import parents from "../parents";
import rendering from "../rendering";
import symbols from "../symbols";

export default function getRefreshedParent(element: HTMLElement): parents.ScrollParent {
    // an animated element stores the parent it belongs to, which is an ancestor's:
    // reuse it only if it is the element's own
    if (element[symbols.SCROLL_PARENT] && element[symbols.SCROLL_PARENT]!.element === element) {
        return element[symbols.SCROLL_PARENT]!.refresh();
    }
    const parent = new parents.ScrollParent(element);
    rendering.addScrollParent(parent);
    return parent;
}
