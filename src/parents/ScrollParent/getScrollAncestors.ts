function canScroll(overflow: string): boolean {
    return overflow !== "visible" && overflow !== "clip";
}

function getFirstScrollParent(element: Element | null): Element | null {
    if (element == null) {
        return null;
    }

    const overflowsVertically: boolean = element.scrollHeight !== element.clientHeight;
    const overflowsHorizontally: boolean = element.scrollWidth !== element.clientWidth;
    if (overflowsVertically || overflowsHorizontally) {
        // the content sticking out of an element with overflow visible or clip does not make it scroll
        const style: CSSStyleDeclaration = getComputedStyle(element);
        if (
            (overflowsVertically && canScroll(style.overflowY)) ||
            (overflowsHorizontally && canScroll(style.overflowX))
        ) {
            return element;
        }
    }
    return getFirstScrollParent(element.parentElement);
}

// scrollable ancestors of the element, without the element itself and the document
export default function getScrollAncestors(element: HTMLElement): HTMLElement[] {
    const ancestors: HTMLElement[] = [];
    let ancestor: Element | null = element;
    while (true) {
        ancestor = getFirstScrollParent(ancestor);
        if (ancestor == null) {
            break;
        }
        // the scroll of the document is window.scrollY, already subtracted in ScrollParent._getRectTop
        if (
            ancestor !== element &&
            ancestor !== document.documentElement &&
            ancestor !== document.scrollingElement
        ) {
            ancestors.push(ancestor as HTMLElement);
        }
        ancestor = ancestor.parentElement;
    }
    return ancestors;
}
