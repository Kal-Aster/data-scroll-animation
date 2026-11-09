type FramePosition = number | "before" | "after";
type Keyframe = [ position: FramePosition, value: string ];
type NeedUpdateAt = { before: boolean, start: number | null, end: number | null, after: boolean };
// for the function keys the value is the list of arguments
type Render = [ target: any, key: string, value: string | unknown[] ];
type Accessor = () => any;
type AnimatedProperty = {
    accessor: Accessor,
    key: string,
    isFunction: boolean,
    // null for the functions without keyframes
    compute: ((frame: FramePosition) => string) | null
};

function nullableMin(first: number | null, second: number | null): number | null {
    if (first == null) {
        return second;
    }
    return second == null ? first : Math.min(first, second);
}
function nullableMax(first: number | null, second: number | null): number | null {
    if (first == null) {
        return second;
    }
    return second == null ? first : Math.max(first, second);
}

// numbers like "5", "-0.5", ".5", "+5" and "1e-3"; hexadecimal colors are matched too only to be
// skipped, so that their digits stay in the fixed parts instead of being interpolated
const NUMBER_PATTERN: RegExp = /#[\da-f]+|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi;

// splits a keyframe value into its numbers and the fixed parts around them:
// staticParts always has one element more than values
function parseKeyframeValue(value: string): { staticParts: string[], values: number[] } {
    const normalizedValue: string = value.replace(/\s+/g, " ").trim()
        .replace(/ ?, ?|\( | \)/g, match => match.trim());
    const staticParts: string[] = [];
    const values: number[] = [];
    let previousMatchEnd: number = 0;
    for (const match of normalizedValue.matchAll(NUMBER_PATTERN)) {
        if (match[0][0] === "#") {
            continue;
        }
        staticParts.push(normalizedValue.slice(previousMatchEnd, match.index));
        values.push(parseFloat(match[0]));
        previousMatchEnd = match.index! + match[0].length;
    }
    staticParts.push(normalizedValue.slice(previousMatchEnd));
    return { staticParts, values };
}

function haveSameShape(staticParts: string[], otherStaticParts: string[]): boolean {
    return staticParts.length === otherStaticParts.length &&
        staticParts.every((staticPart, index) => staticPart === otherStaticParts[index]);
}

function computeFrames(frames: Keyframe[], extrapolate: boolean = false): {
    compute: (frame: FramePosition) => string,
    needUpdateAt: NeedUpdateAt
 } {
    // fixed parts of the first keyframe: the keyframes are interpolated only if they all match it
    let shape: string[] | null = null;
    let frameNumbers: number[] = [];
    let frameValues: number[][] = [];
    let beforeValue: string | null = null;
    let afterValue: string | null = null;
    const needUpdateAt: NeedUpdateAt = { before: false, start: null, end: null, after: false };
    function getNearestLeftIndexOf(frameNumber: number): number {
        if (frameNumbers.length === 0) {
            return -1;
        }
        let leftIndex: number = 0;
        for (let index: number = 1; index < frameNumbers.length; index++) {
            if (frameNumbers[index] > frameNumber) {
                break;
            }
            leftIndex = index;
        }
        return leftIndex;
    }
    {
        let constants: boolean = false;
        frames.sort((firstFrame, secondFrame) => {
            const first = firstFrame[0], second = secondFrame[0];
            let result: number;
            if (first === "before") {
                result = second === "after" ? -1 : second === "before" ? 0 : 1;
            } else if (first === "after") {
                result = second === "after" ? 0 : second === "before" ? 1 : -1;
            } else if (second === "before") {
                result = -1;
            } else if (second === "after") {
                result = -1;
            } else {
                result = first - second;
            }
            return result;
        });
        for (const frame of frames) {
            if (frame[0] === "after") {
                afterValue = frame[1];
                needUpdateAt.after = true;
                continue;
            } else if (frame[0] === "before") {
                beforeValue = frame[1];
                needUpdateAt.before = true;
                continue;
            }
            frameNumbers.push(frame[0]);
            needUpdateAt.start = nullableMin(needUpdateAt.start, frame[0]);
            needUpdateAt.end = nullableMax(needUpdateAt.end, frame[0]);
            if (!constants) {
                const { staticParts, values } = parseKeyframeValue(frame[1]);
                if (shape == null) {
                    shape = staticParts;
                }
                // same fixed parts means same count and positions of the numbers
                if (haveSameShape(staticParts, shape)) {
                    frameValues.push(values);
                } else {
                    constants = true;
                }
            }
        }
        if (constants) {
            // without before/after keep the first/last keyframe: the sort puts before and after
            // after the keyframes, so the last keyframe is at frameNumbers.length - 1
            const constantBeforeValue: string = beforeValue ?? frames[0][1];
            const constantAfterValue: string = afterValue ?? frames[frameNumbers.length - 1][1];
            return {
                compute: (frameNumber: FramePosition) => {
                    if (frameNumber === "before") {
                        return constantBeforeValue;
                    } else if (frameNumber === "after") {
                        return constantAfterValue;
                    }
                    const index: number = getNearestLeftIndexOf(frameNumber);
                    if (index === -1) {
                        return "";
                    }
                    return frames[index][1];
                },
                needUpdateAt
            };
        }
    }
    if (frameValues.length === 0) {
        return {
            compute: (frameNumber: FramePosition) => {
                if (frameNumber === "before" && beforeValue != null) {
                    return beforeValue;
                } else if (frameNumber === "after" && afterValue != null) {
                    return afterValue;
                }
                return "";
            },
            needUpdateAt: { before: needUpdateAt.before, start: null, end: null, after: needUpdateAt.after }
        };
    }
    // extrapolating needs a segment to extend, otherwise the flag is ignored
    const extrapolating: boolean = extrapolate && frameNumbers.length >= 2;
    if (extrapolating) {
        // values change over the whole range, not only between the keyframes
        needUpdateAt.start = 0;
        needUpdateAt.end = 1;
    }
    // every interpolated keyframe has the same shape, so it has staticStringArray.length - 1 values
    const staticStringArray: string[] = shape!;
    const valuesLength: number = staticStringArray.length - 1;
    function constructString(values: number[], nextValues: number[] | null, percentage: number): string {
        let constructedString: string = staticStringArray[0];
        for (let valueIndex = 0; valueIndex < valuesLength; valueIndex++) {
            let value: number = values[valueIndex];
            if (nextValues !== null) {
                value = value + ((nextValues[valueIndex] - value) * percentage);
            }
            constructedString += value.toString() + staticStringArray[valueIndex + 1];
        }
        return constructedString;
    }
    return {
        compute: (frameNumber: FramePosition) => {
            if (frameNumber === "before") {
                if (beforeValue != null) {
                    return beforeValue;
                }
                return constructString(frameValues[0], null, 0);
            } else if (frameNumber === "after") {
                if (afterValue != null) {
                    return afterValue;
                }
                return constructString(frameValues[frameValues.length - 1], null, 0);
            }
            frameNumber = Math.min(Math.max(0, frameNumber), 1);
            let index: number = getNearestLeftIndexOf(frameNumber);
            if (index === -1) {
                return "";
            }
            if (frameNumber < frameNumbers[0]) {
                // before the first keyframe: keep the first value or extend the first segment
                if (!extrapolating) {
                    return constructString(frameValues[0], null, 0);
                }
            } else if (index === frameNumbers.length - 1) {
                // after the last keyframe: keep the last value or extend the last segment
                if (!extrapolating) {
                    return constructString(frameValues[index], null, 0);
                }
                index--;
            }
            const left: number = frameNumbers[index];
            const right: number = frameNumbers[index + 1];
            const progress: number = (frameNumber-left)/(right-left);
            return constructString(frameValues[index], frameValues[index + 1], progress);
        },
        needUpdateAt
    };
}

const SCROLL_OBJECT: unique symbol = Symbol("scroll-object");
const SCROLL_PARENT: unique symbol =  Symbol("scroll-parent");

declare global {
    /* tslint:disable-next-line:interface-name */
    interface HTMLElement {
        [SCROLL_OBJECT]: ScrollObject | undefined;
        [SCROLL_PARENT]: ScrollParent | undefined;
    }
}

class ScrollObject {
    constructor(readonly element: HTMLElement, frames: { [key: string]: Keyframe[] }, extrapolatedKeys: { [key: string]: boolean } = {}) {
        this.refresh(frames, extrapolatedKeys);
    }
    refresh(frames: { [key: string]: Keyframe[] }, extrapolatedKeys: { [key: string]: boolean } = {}): ScrollObject {
        this.element[SCROLL_OBJECT] = this;
        this._frames = [];
        for (let key in frames) {
            if (!Object.prototype.hasOwnProperty.call(frames, key)) {
                continue;
            }
            const splitKey: string[] = key.split(".");
            const [isValid, lastKey, isFunction] = splitKey.pop()!.match(/^([^\(\)]*)(\(\))?$/) || [];
            if (!isValid) {
                continue;
            }
            const hasFrames: boolean = frames[key].length > 0;
            const { compute, needUpdateAt } = computeFrames(frames[key], extrapolatedKeys[key] === true);
            if (
                isFunction &&
                !needUpdateAt.before && needUpdateAt.start == null &&
                needUpdateAt.end == null && !needUpdateAt.after
            ) {
                needUpdateAt.before = true;
                needUpdateAt.start = 0;
                needUpdateAt.end = 1;
                needUpdateAt.after = true;
            }
            const keyLength = splitKey.length;
            const accessor: Accessor = () => {
                let lastObject: any = this.element;
                for (let keyIndex = 0; keyIndex < keyLength; keyIndex++) {
                    if (lastObject == null) {
                        return null;
                    }
                    lastObject = lastObject[splitKey[keyIndex]];
                }
                return lastObject;
            }
            this._frames.push({
                accessor,
                key: lastKey,
                isFunction: isFunction != null,
                compute: isFunction && !hasFrames ? null : compute
            });

            this._needUpdateAt.before = this._needUpdateAt.before || needUpdateAt.before;
            this._needUpdateAt.start = nullableMin(this._needUpdateAt.start, needUpdateAt.start);
            this._needUpdateAt.end = nullableMax(this._needUpdateAt.end, needUpdateAt.end);
            this._needUpdateAt.after = this._needUpdateAt.after || needUpdateAt.after;
        }
        this._lastRenderFrame = null;
        this.element[SCROLL_PARENT]!.refresh();
        return this;
    }
    _needUpdateAt: NeedUpdateAt = { before: false, start: null, end: null, after: false };
    _frames: AnimatedProperty[] = [];
    _lastRenderFrame: FramePosition | null = null;
    render(frame: FramePosition, renders: Render[], force: boolean = false): Render[] {
        if (!force &&
            this._lastRenderFrame === frame
        ) {
            return renders;
        }
        const { start, end } = this._needUpdateAt;
        if (
            this._lastRenderFrame != null &&
            frame !== "before" && frame !== "after" &&
            this._lastRenderFrame !== "before" &&
            this._lastRenderFrame !== "after" &&
            (
                (start == null || frame < start) ||
                (end == null || frame > end)
            ) &&
            (
                (start == null || this._lastRenderFrame < start) ||
                (end == null || this._lastRenderFrame > end)
            )
        ) {
            return renders;
        }
        this._lastRenderFrame = frame;
        for (let frameIndex = this._frames.length - 1; frameIndex >= 0; frameIndex--) {
            const { accessor, key, isFunction, compute } = this._frames[frameIndex];
            const object = accessor();
            if (object == null) {
                continue;
            }
            if (compute == null) {
                renders.push([object, key, [frame]]);
            } else if (isFunction) {
                renders.push([object, key, [
                    frame,
                    ...compute(frame).split(",").map(argument => argument.trim()).filter(argument => argument !== "")
                ]]);
            } else {
                renders.push([object, key, compute(frame)]);
            }
        }
        return renders;
    }
}

function getFirstScrollParent(element: Element | null): Element | null {
    if (element == null) {
        return null;
    }

    if (
        element.scrollHeight !== element.clientHeight ||
        element.scrollWidth !== element.scrollWidth
    ) {
        return element;
    }
    return getFirstScrollParent(element.parentElement);
}

class ScrollParent {
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
        this._parents = [];
        let ancestor: Element | null = this.element;
        while (true) {
            ancestor = getFirstScrollParent(ancestor);
            if (ancestor == null) {
                break;
            }
            if (ancestor !== this.element && ancestor !== document.documentElement) {
                this._parents.push(ancestor as HTMLElement);
            }
            ancestor = ancestor.parentElement;
        }
    }
    children: ScrollObject[] = [];
    trigger: number = 0;
    topOffset: number = 0;
    bottomOffset: number = 0;
    _lastPosition: FramePosition | null = null;
    _needsRefresh: boolean = true;
    _parents: HTMLElement[] = [];
    _getRectTop(): number {
        let top: number = this.element.offsetTop;
        let lastParentScrollTop: null | number = null;
        for (let parentIndex = this._parents.length - 1; parentIndex >= 0; parentIndex--) {
            const parent = this._parents[parentIndex];
            top += parent.offsetTop - parent.scrollTop;
            if (parent.parentElement == null) {
                lastParentScrollTop = parent.scrollTop;
            }
        }
        return top - (lastParentScrollTop == window.scrollY ? 0 : window.scrollY);
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

const baseScrollParent: ScrollParent = new ScrollParent(document.documentElement);
document.body[SCROLL_PARENT] = baseScrollParent;

const scrollParents: ScrollParent[] = [
    baseScrollParent
];

function render(): void {
    const renders: Render[] = [];
    for (let parentIndex = scrollParents.length - 1; parentIndex >= 0; parentIndex--) {
        scrollParents[parentIndex].render(renders);
    }
    for (let renderIndex = renders.length - 1; renderIndex >= 0; renderIndex--) {
        const render = renders[renderIndex];
        const result = render[2];
        const object = render[0];
        if (Array.isArray(result)) {
            object[render[1]].apply(object, result);
        } else {
            object[render[1]] = result;
        }
    }
}

let stop: boolean = false;
let started: boolean = false;
function startLoop(): void {
    stop = false;
    if (started) {
        return;
    }
    started = true;
    requestAnimationFrame(function loop(): void {
        if (!stop) {
            render();
            requestAnimationFrame(loop);
        }
    });
}
function endLoop(): void {
    stop = true;
    started = false;
}

function getRefreshedParent(element: HTMLElement): ScrollParent {
    // an animated element stores the parent it belongs to, which is an ancestor's:
    // reuse it only if it is the element's own
    if (element[SCROLL_PARENT] && element[SCROLL_PARENT]!.element === element) {
        return element[SCROLL_PARENT]!.refresh();
    }
    const parent = new ScrollParent(element);
    scrollParents.push(parent);
    return parent;
}

function parse(element: HTMLElement, parent: ScrollParent, subtree: boolean = true): void {
    let scrollOptions: { [key: string]: Keyframe[] } | null = null;
    const extrapolatedKeys: { [key: string]: boolean } = {};
    for (const attribute of element.attributes) {
        if (!attribute.name.startsWith("data-scroll-") && !attribute.name.startsWith("data-scroll.")) {
            continue;
        }
        const data: string = attribute.name.slice(11);
        if (data === "-parent") {
            parent = getRefreshedParent(element);
        } else if (data === "-trigger") {
            let trigger: number = parseFloat(attribute.value);
            if (!isNaN(trigger)) {
                parent = getRefreshedParent(element);
                parent.trigger = trigger;
            }
        } else if (data === "-bottom") {
            let bottom: number = parseFloat(attribute.value);
            if (!isNaN(bottom)) {
                parent = getRefreshedParent(element);
                parent.bottomOffset = bottom;
            }
        } else if (data === "-top") {
            let top: number = parseFloat(attribute.value);
            if (!isNaN(top)) {
                parent = getRefreshedParent(element);
                parent.topOffset = top;
            }
        } else {
            const dataSplit: string[] = data.split("-");
            dataSplit.shift();
            if (dataSplit.length > 2 || dataSplit.length === 0) {
                continue;
            }
            if (scrollOptions == null) {
                scrollOptions = {};
            }
            // convert "_[a-z]" to "[A-Z]" and "__" to "_"
            const propertyName: string = dataSplit[0].replace(/(?:^|[\Wa-zA-Z])(_[a-zA-Z])/, function (match: string, underscoreLetter: string): string {
                return match.replace(underscoreLetter, underscoreLetter[1].toUpperCase());
            }).replace("__", "_");
            if (dataSplit.length === 1 && dataSplit[0].match(/(.*)\(\)$/)) {
                scrollOptions[propertyName] = [];
            } else {
                const frameName: string = dataSplit[1];
                const frame: number = parseFloat(frameName);
                let position: FramePosition;
                if (!isNaN(frame)) {
                    position = frame;
                } else if (frameName === "before" || frameName === "after") {
                    position = frameName;
                } else if (frameName === "extrapolate") {
                    // the attribute value is ignored
                    extrapolatedKeys[propertyName] = true;
                    continue;
                } else {
                    continue;
                }
                (scrollOptions[propertyName] = scrollOptions[propertyName] || []).push([ position, attribute.value ]);
            }
        }
    }
    if (scrollOptions != null) {
        element[SCROLL_PARENT] = parent;
        if (element[SCROLL_OBJECT]) {
            element[SCROLL_OBJECT]!.refresh(scrollOptions, extrapolatedKeys);
        } else {
            parent.children.push(new ScrollObject(element, scrollOptions, extrapolatedKeys));
        }
    }
    if (subtree) {
        for (const child of element.children) {
            parse(child as HTMLElement, parent);
        }
    }
}

export function add(element: HTMLElement, subtree: boolean = true): void {
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
        if (baseScrollParent.children.length === 0) {
            scrollParents.push(baseScrollParent);
        }
    }
    parse(element, firstScrollParent, subtree);
    if (scrollParents.length > 0) {
        startLoop();
    }
}
export function remove(element: HTMLElement, renderFrame: FramePosition | null = null): void {
    let scrollParent: ScrollParent | undefined = element[SCROLL_PARENT];
    let scrollObject: ScrollObject | undefined = element[SCROLL_OBJECT];
    if (scrollParent != null) {
        if (scrollParent.element === element) {
            const index: number = scrollParents.indexOf(scrollParent);
            if (index !== -1) {
                scrollParents.splice(index, 1);
            }
        }
        if (scrollObject != null) {
            scrollParent.remove(scrollObject);
            if (renderFrame != null) {
                const renders: Render[] = [];
                scrollObject.render(renderFrame, renders, true);
                for (let renderIndex = renders.length - 1; renderIndex >= 0; renderIndex--) {
                    const render = renders[renderIndex];
                    render[0][render[1]] = render[2];
                }
            }
        }
        delete element[SCROLL_PARENT];
        delete element[SCROLL_OBJECT];
    }
    for (const child of element.children) {
        remove(child as HTMLElement, renderFrame);
    }
    if (scrollParent === baseScrollParent && baseScrollParent.children.length === 0) {
        const index: number = scrollParents.indexOf(baseScrollParent);
        if (index !== -1) {
            scrollParents.splice(index, 1);
        }
    }
    if (scrollParents.length === 0) {
        endLoop();
    }
}
