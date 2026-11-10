import elements from "../elements";
import frames from "../frames";
import parents from "../parents";
import symbols from "../symbols";

// creates or refreshes the scroll object of the element and moves it to the parent
export default function attachScrollObject(
    element: HTMLElement,
    parent: parents.ScrollParent,
    scrollOptions: { [key: string]: frames.Keyframe[] },
    extrapolatedKeys: { [key: string]: boolean }
): void {
    const previousParent: parents.ScrollParent | undefined = element[symbols.SCROLL_PARENT];
    let scrollObject: elements.ScrollObject | undefined = element[symbols.SCROLL_OBJECT];
    if (scrollObject != null && previousParent != null && previousParent !== parent) {
        previousParent.remove(scrollObject);
    }
    // ScrollObject.refresh refreshes element[SCROLL_PARENT], so the new parent must be set first
    element[symbols.SCROLL_PARENT] = parent;
    if (scrollObject != null) {
        scrollObject.refresh(scrollOptions, extrapolatedKeys);
    } else {
        scrollObject = new elements.ScrollObject(element, scrollOptions, extrapolatedKeys);
    }
    parent.add(scrollObject);
}
