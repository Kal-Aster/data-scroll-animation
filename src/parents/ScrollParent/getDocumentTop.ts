// position in the document, going up the offsetParent chain, without the scroll of the ancestors
export default function getDocumentTop(element: HTMLElement): number {
    let top: number = 0;
    let currentElement: HTMLElement = element;
    while (true) {
        top += currentElement.offsetTop;
        const offsetParent: HTMLElement | null = currentElement.offsetParent as HTMLElement | null;
        // when the offsetParent is the body, offsetTop is already relative to the document
        if (offsetParent == null || offsetParent === document.body) {
            break;
        }
        // offsetTop is relative to the padding edge of the offsetParent, not to its border
        top += offsetParent.clientTop;
        currentElement = offsetParent;
    }
    return top;
}
