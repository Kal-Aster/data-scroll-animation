import { ScrollObject } from "../elements";
import type { Keyframe } from "../frames";
import type { ScrollParent } from "../parents";
import { SCROLL_OBJECT, SCROLL_PARENT } from "../symbols";

// creates or refreshes the scroll object of the element and moves it to the parent
export default function attachScrollObject(
    element: HTMLElement,
    parent: ScrollParent,
    scrollOptions: { [key: string]: Keyframe[] },
    extrapolatedKeys: { [key: string]: boolean }
): void {
    const previousParent: ScrollParent | undefined = element[SCROLL_PARENT];
    let scrollObject: ScrollObject | undefined = element[SCROLL_OBJECT];
    if (scrollObject != null && previousParent != null && previousParent !== parent) {
        previousParent.remove(scrollObject);
    }
    // ScrollObject.refresh refreshes element[SCROLL_PARENT], so the new parent must be set first
    element[SCROLL_PARENT] = parent;
    if (scrollObject != null) {
        scrollObject.refresh(scrollOptions, extrapolatedKeys);
    } else {
        scrollObject = new ScrollObject(element, scrollOptions, extrapolatedKeys);
    }
    parent.add(scrollObject);
}
