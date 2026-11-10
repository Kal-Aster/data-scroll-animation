import parents from "../parents";
import rendering from "../rendering";
import symbols from "../symbols";

import parse from "./parse";

export default function add(element: HTMLElement, subtree: boolean = true): void {
    let parent: HTMLElement | null = element;
    let firstScrollParent: parents.ScrollParent | undefined = element[symbols.SCROLL_PARENT];
    while (parent !== document.body && parent != null) {
        parent = parent.parentElement;
        if (parent == null) {
            return;
        }
        firstScrollParent = firstScrollParent || parent[symbols.SCROLL_PARENT];
    }
    const baseScrollParent: parents.ScrollParent = parents.getBaseScrollParent();
    if (firstScrollParent == null) {
        firstScrollParent = baseScrollParent;
    }
    parse(element, firstScrollParent, subtree);
    if (baseScrollParent.children.length > 0) {
        rendering.addScrollParent(baseScrollParent);
    }
    if (rendering.scrollParents.size > 0) {
        rendering.startLoop();
        rendering.requestRender();
    }
}
