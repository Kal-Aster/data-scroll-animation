import { baseScrollParent, type ScrollParent } from "../parents";
import { addScrollParent, requestRender, scrollParents, startLoop } from "../rendering";
import { SCROLL_PARENT } from "../symbols";
import parse from "./parse";

export default function add(element: HTMLElement, subtree: boolean = true): void {
    let parent: HTMLElement | null = element;
    let firstScrollParent: ScrollParent | undefined = element[SCROLL_PARENT];
    while (parent !== document.body && parent != null) {
        parent = parent.parentElement;
        if (parent == null) {
            return;
        }
        firstScrollParent = firstScrollParent || parent[SCROLL_PARENT];
    }
    if (firstScrollParent == null) {
        firstScrollParent = baseScrollParent;
    }
    parse(element, firstScrollParent, subtree);
    if (baseScrollParent.children.length > 0) {
        addScrollParent(baseScrollParent);
    }
    if (scrollParents.size > 0) {
        startLoop();
        requestRender();
    }
}
