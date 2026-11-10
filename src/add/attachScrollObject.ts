import elements from "../elements";
import frames from "../frames";
import parents from "../parents";
import symbols from "../symbols";

export default function attachScrollObject(
    element: HTMLElement,
    parent: parents.ScrollParent,
    scrollOptions: { [key: string]: frames.Keyframe[] },
    optionsByKey: { [key: string]: frames.InterpolationOptions }
): void {
    const previousParent: parents.ScrollParent | undefined = element[symbols.SCROLL_PARENT];
    let scrollObject: elements.ScrollObject | undefined = element[symbols.SCROLL_OBJECT];
    if (scrollObject != null && previousParent != null && previousParent !== parent) {
        previousParent.remove(scrollObject);
    }
    // ScrollObject.refresh refreshes element[SCROLL_PARENT], so the new parent must be set first
    element[symbols.SCROLL_PARENT] = parent;
    if (scrollObject != null) {
        scrollObject.refresh(scrollOptions, optionsByKey);
    } else {
        scrollObject = new elements.ScrollObject(element, scrollOptions, optionsByKey);
    }
    parent.add(scrollObject);
}
