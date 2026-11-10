import type { ScrollObject } from "../../elements";
import type { FramePosition } from "../../frames";
import type { Render } from "../../rendering";
import { SCROLL_PARENT } from "../../symbols";
import getDocumentTop from "./getDocumentTop";
import getScrollAncestors from "./getScrollAncestors";

export default class ScrollParent {
    constructor(readonly element: HTMLElement) {
        element[SCROLL_PARENT] = this;
    }
    refresh(): ScrollParent {
        this._lastPosition = null;
        this._needsRefresh = true;
        return this;
    }
    _refreshParents(): void {
        this._needsRefresh = false;
        this._parents = getScrollAncestors(this.element);
    }
    children: ScrollObject[] = [];
    trigger: number = 0;
    topOffset: number = 0;
    bottomOffset: number = 0;
    _lastPosition: FramePosition | null = null;
    _needsRefresh: boolean = true;
    _parents: HTMLElement[] = [];
    // offsetTop ignores the CSS transforms, unlike getBoundingClientRect:
    // an animation transforming an ancestor does not move the range it is computed on
    _getRectTop(): number {
        let top: number = getDocumentTop(this.element);
        // scroll of the ancestors
        for (let parentIndex = this._parents.length - 1; parentIndex >= 0; parentIndex--) {
            top -= this._parents[parentIndex].scrollTop;
        }
        return top - window.scrollY;
    }
    render(renders: Render[]): Render[] {
        if (this.children.length === 0 || (this.element.clientHeight === 0 && this.element.clientWidth === 0)) {
            return renders;
        }
        if (this._needsRefresh) {
            this._refreshParents();
        }
        const rectTop: number = this._getRectTop();
        const rectBottom: number = rectTop + this.element.offsetHeight;
        const trigger: number = document.documentElement.clientHeight * this.trigger;
        const top: number = rectTop - this.topOffset;
        const bottom: number = rectBottom + this.bottomOffset;
        let actualPosition: FramePosition;
        if (bottom - top <= 0) {
            // empty range: avoid dividing by zero, decide only by the trigger
            actualPosition = trigger < top ? "before" : "after";
        } else {
            const position: number = (trigger - top) / (bottom - top);
            actualPosition = position > 1 ? "after" : position < 0 ? "before" : position;
        }
        if (actualPosition === this._lastPosition) {
            return renders;
        }
        this._lastPosition = actualPosition;
        for (let childIndex = this.children.length - 1; childIndex >= 0; childIndex--) {
            this.children[childIndex].render(this._lastPosition!, renders);
        }
        return renders;
    }
    remove(scrollObject: ScrollObject): void {
        const index: number = this.children.findIndex(child => child === scrollObject || child.element === scrollObject.element);
        if (index !== -1) {
            this.children.splice(index, 1);
            this._lastPosition = null;
        }
    }
    add(scrollObject: ScrollObject): void {
        this.remove(scrollObject);
        this.children.push(scrollObject);
        this._lastPosition = null;
    }
}
