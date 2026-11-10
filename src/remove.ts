import type { ScrollObject } from "./elements";
import type { FramePosition } from "./frames";
import { baseScrollParent, type ScrollParent } from "./parents";
import { applyRenders, deleteScrollParent, endLoop, scrollParents } from "./rendering";
import { SCROLL_OBJECT, SCROLL_PARENT } from "./symbols";

export default function remove(element: HTMLElement, renderFrame: FramePosition | null = null): void {
    let scrollParent: ScrollParent | undefined = element[SCROLL_PARENT];
    let scrollObject: ScrollObject | undefined = element[SCROLL_OBJECT];
    if (scrollParent != null) {
        if (scrollParent.element === element) {
            deleteScrollParent(scrollParent);
        }
        if (scrollObject != null) {
            scrollParent.remove(scrollObject);
            if (renderFrame != null) {
                applyRenders(scrollObject.render(renderFrame, [], true));
            }
        }
        delete element[SCROLL_PARENT];
        delete element[SCROLL_OBJECT];
    }
    for (const child of element.children) {
        remove(child as HTMLElement, renderFrame);
    }
    if (scrollParent === baseScrollParent && baseScrollParent.children.length === 0) {
        deleteScrollParent(baseScrollParent);
    }
    if (scrollParents.size === 0) {
        endLoop();
    }
}
