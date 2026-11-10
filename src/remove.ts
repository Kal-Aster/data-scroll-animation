import elements from "./elements";
import frames from "./frames";
import parents from "./parents";
import rendering from "./rendering";
import symbols from "./symbols";

export default function remove(element: HTMLElement, renderFrame: frames.FramePosition | null = null): void {
    let scrollParent: parents.ScrollParent | undefined = element[symbols.SCROLL_PARENT];
    let scrollObject: elements.ScrollObject | undefined = element[symbols.SCROLL_OBJECT];
    if (scrollParent != null) {
        if (scrollParent.element === element) {
            rendering.deleteScrollParent(scrollParent);
        }
        if (scrollObject != null) {
            scrollParent.remove(scrollObject);
            if (renderFrame != null) {
                rendering.applyRenders(scrollObject.render(renderFrame, [], true));
            }
        }
        delete element[symbols.SCROLL_PARENT];
        delete element[symbols.SCROLL_OBJECT];
    }
    for (const child of element.children) {
        remove(child as HTMLElement, renderFrame);
    }
    if (scrollParent === parents.baseScrollParent && parents.baseScrollParent.children.length === 0) {
        rendering.deleteScrollParent(parents.baseScrollParent);
    }
    if (rendering.scrollParents.size === 0) {
        rendering.endLoop();
    }
}
