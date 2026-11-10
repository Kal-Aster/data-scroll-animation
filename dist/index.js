(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.dataScrollAnimation = {}));
})(this, (function (exports) { 'use strict';

    function nullableMin(first, second) {
        if (first == null) {
            return second;
        }
        return second == null ? first : Math.min(first, second);
    }
    function nullableMax(first, second) {
        if (first == null) {
            return second;
        }
        return second == null ? first : Math.max(first, second);
    }
    // numbers like "5", "-0.5", ".5", "+5" and "1e-3"; hexadecimal colors are matched too only to be
    // skipped, so that their digits stay in the fixed parts instead of being interpolated
    const NUMBER_PATTERN = /#[\da-f]+|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi;
    // splits a keyframe value into its numbers and the fixed parts around them:
    // staticParts always has one element more than values
    function parseKeyframeValue(value) {
        const normalizedValue = value.replace(/\s+/g, " ").trim()
            .replace(/ ?, ?|\( | \)/g, match => match.trim());
        const staticParts = [];
        const values = [];
        let previousMatchEnd = 0;
        for (const match of normalizedValue.matchAll(NUMBER_PATTERN)) {
            if (match[0][0] === "#") {
                continue;
            }
            staticParts.push(normalizedValue.slice(previousMatchEnd, match.index));
            values.push(parseFloat(match[0]));
            previousMatchEnd = match.index + match[0].length;
        }
        staticParts.push(normalizedValue.slice(previousMatchEnd));
        return { staticParts, values };
    }
    function haveSameShape(staticParts, otherStaticParts) {
        return staticParts.length === otherStaticParts.length &&
            staticParts.every((staticPart, index) => staticPart === otherStaticParts[index]);
    }
    // constants: the computed value only changes when passing from a keyframe to another
    function computeFrames(frames, extrapolate = false) {
        // fixed parts of the first keyframe: the keyframes are interpolated only if they all match it
        let shape = null;
        let frameNumbers = [];
        let frameValues = [];
        let beforeValue = null;
        let afterValue = null;
        const needUpdateAt = { before: false, start: null, end: null, after: false };
        function getNearestLeftIndexOf(frameNumber) {
            if (frameNumbers.length === 0) {
                return -1;
            }
            let leftIndex = 0;
            for (let index = 1; index < frameNumbers.length; index++) {
                if (frameNumbers[index] > frameNumber) {
                    break;
                }
                leftIndex = index;
            }
            return leftIndex;
        }
        {
            let constants = false;
            frames.sort((firstFrame, secondFrame) => {
                const first = firstFrame[0], second = secondFrame[0];
                let result;
                if (first === "before") {
                    result = second === "after" ? -1 : second === "before" ? 0 : 1;
                }
                else if (first === "after") {
                    result = second === "after" ? 0 : second === "before" ? 1 : -1;
                }
                else if (second === "before") {
                    result = -1;
                }
                else if (second === "after") {
                    result = -1;
                }
                else {
                    result = first - second;
                }
                return result;
            });
            for (const frame of frames) {
                if (frame[0] === "after") {
                    afterValue = frame[1];
                    needUpdateAt.after = true;
                    continue;
                }
                else if (frame[0] === "before") {
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
                    }
                    else {
                        constants = true;
                    }
                }
            }
            if (constants) {
                // without before/after keep the first/last keyframe: the sort puts before and after
                // after the keyframes, so the last keyframe is at frameNumbers.length - 1
                const constantBeforeValue = beforeValue ?? frames[0][1];
                const constantAfterValue = afterValue ?? frames[frameNumbers.length - 1][1];
                return {
                    compute: (frameNumber) => {
                        if (frameNumber === "before") {
                            return constantBeforeValue;
                        }
                        else if (frameNumber === "after") {
                            return constantAfterValue;
                        }
                        const index = getNearestLeftIndexOf(frameNumber);
                        if (index === -1) {
                            return "";
                        }
                        return frames[index][1];
                    },
                    needUpdateAt,
                    constants: true
                };
            }
        }
        if (frameValues.length === 0) {
            return {
                compute: (frameNumber) => {
                    if (frameNumber === "before" && beforeValue != null) {
                        return beforeValue;
                    }
                    else if (frameNumber === "after" && afterValue != null) {
                        return afterValue;
                    }
                    return "";
                },
                needUpdateAt: { before: needUpdateAt.before, start: null, end: null, after: needUpdateAt.after },
                constants: true
            };
        }
        // extrapolating needs a segment to extend, otherwise the flag is ignored
        const extrapolating = extrapolate && frameNumbers.length >= 2;
        if (extrapolating) {
            // values change over the whole range, not only between the keyframes
            needUpdateAt.start = 0;
            needUpdateAt.end = 1;
        }
        // every interpolated keyframe has the same shape, so it has staticStringArray.length - 1 values
        const staticStringArray = shape;
        const valuesLength = staticStringArray.length - 1;
        function constructString(values, nextValues, percentage) {
            let constructedString = staticStringArray[0];
            for (let valueIndex = 0; valueIndex < valuesLength; valueIndex++) {
                let value = values[valueIndex];
                if (nextValues !== null) {
                    // rounded to 4 decimals so that close scroll positions give the same string and the browser
                    // skips recalculating the style; toFixed is avoided because it adds trailing zeros
                    value = Math.round((value + ((nextValues[valueIndex] - value) * percentage)) * 10000) / 10000;
                }
                constructedString += value.toString() + staticStringArray[valueIndex + 1];
            }
            return constructedString;
        }
        return {
            compute: (frameNumber) => {
                if (frameNumber === "before") {
                    if (beforeValue != null) {
                        return beforeValue;
                    }
                    return constructString(frameValues[0], null, 0);
                }
                else if (frameNumber === "after") {
                    if (afterValue != null) {
                        return afterValue;
                    }
                    return constructString(frameValues[frameValues.length - 1], null, 0);
                }
                frameNumber = Math.min(Math.max(0, frameNumber), 1);
                let index = getNearestLeftIndexOf(frameNumber);
                if (index === -1) {
                    return "";
                }
                if (frameNumber < frameNumbers[0]) {
                    // before the first keyframe: keep the first value or extend the first segment
                    if (!extrapolating) {
                        return constructString(frameValues[0], null, 0);
                    }
                }
                else if (index === frameNumbers.length - 1) {
                    // after the last keyframe: keep the last value or extend the last segment
                    if (!extrapolating) {
                        return constructString(frameValues[index], null, 0);
                    }
                    index--;
                }
                const left = frameNumbers[index];
                const right = frameNumbers[index + 1];
                const progress = (frameNumber - left) / (right - left);
                return constructString(frameValues[index], frameValues[index + 1], progress);
            },
            needUpdateAt,
            constants: false
        };
    }
    // the value doesn't change between the last rendered frame and this one
    // when both are outside the update range on the same side
    function canSkipRender(frame, lastRenderFrame, needUpdateAt) {
        return (lastRenderFrame != null &&
            frame !== "before" && frame !== "after" &&
            lastRenderFrame !== "before" &&
            lastRenderFrame !== "after" &&
            (needUpdateAt.start == null || needUpdateAt.end == null ||
                (frame < needUpdateAt.start && lastRenderFrame < needUpdateAt.start) ||
                (frame > needUpdateAt.end && lastRenderFrame > needUpdateAt.end)));
    }
    const SCROLL_OBJECT = Symbol("scroll-object");
    const SCROLL_PARENT = Symbol("scroll-parent");
    class ScrollObject {
        element;
        constructor(element, frames, extrapolatedKeys = {}) {
            this.element = element;
            this.refresh(frames, extrapolatedKeys);
        }
        refresh(frames, extrapolatedKeys = {}) {
            this.element[SCROLL_OBJECT] = this;
            this._frames = [];
            for (let key in frames) {
                if (!Object.prototype.hasOwnProperty.call(frames, key)) {
                    continue;
                }
                const splitKey = key.split(".");
                const [isValid, lastKey, isFunction] = splitKey.pop().match(/^([^\(\)]*)(\(\))?$/) || [];
                if (!isValid) {
                    continue;
                }
                const hasFrames = frames[key].length > 0;
                const { compute, needUpdateAt, constants } = computeFrames(frames[key], extrapolatedKeys[key] === true);
                if (isFunction &&
                    !needUpdateAt.before && needUpdateAt.start == null &&
                    needUpdateAt.end == null && !needUpdateAt.after) {
                    needUpdateAt.before = true;
                    needUpdateAt.start = 0;
                    needUpdateAt.end = 1;
                    needUpdateAt.after = true;
                }
                const keyLength = splitKey.length;
                const accessor = () => {
                    let lastObject = this.element;
                    for (let keyIndex = 0; keyIndex < keyLength; keyIndex++) {
                        if (lastObject == null) {
                            return null;
                        }
                        lastObject = lastObject[splitKey[keyIndex]];
                    }
                    return lastObject;
                };
                this._frames.push({
                    accessor,
                    key: lastKey,
                    isFunction: isFunction != null,
                    compute: isFunction && !hasFrames ? null : compute,
                    needUpdateAt,
                    constants,
                    lastWrittenValue: null
                });
                this._needUpdateAt.before = this._needUpdateAt.before || needUpdateAt.before;
                this._needUpdateAt.start = nullableMin(this._needUpdateAt.start, needUpdateAt.start);
                this._needUpdateAt.end = nullableMax(this._needUpdateAt.end, needUpdateAt.end);
                this._needUpdateAt.after = this._needUpdateAt.after || needUpdateAt.after;
            }
            this._lastRenderFrame = null;
            this.element[SCROLL_PARENT].refresh();
            return this;
        }
        _needUpdateAt = { before: false, start: null, end: null, after: false };
        _frames = [];
        _lastRenderFrame = null;
        render(frame, renders, force = false) {
            if (!force &&
                this._lastRenderFrame === frame) {
                return renders;
            }
            if (canSkipRender(frame, this._lastRenderFrame, this._needUpdateAt)) {
                return renders;
            }
            const lastRenderFrame = this._lastRenderFrame;
            this._lastRenderFrame = frame;
            for (let frameIndex = this._frames.length - 1; frameIndex >= 0; frameIndex--) {
                const animatedProperty = this._frames[frameIndex];
                const { accessor, key, isFunction, compute } = animatedProperty;
                // functions are always called
                if (!isFunction && canSkipRender(frame, lastRenderFrame, animatedProperty.needUpdateAt)) {
                    continue;
                }
                const object = accessor();
                if (object == null) {
                    continue;
                }
                if (compute == null) {
                    renders.push([object, key, [frame]]);
                }
                else if (isFunction) {
                    renders.push([object, key, [
                            frame,
                            ...compute(frame).split(",").map(argument => argument.trim()).filter(argument => argument !== "")
                        ]]);
                }
                else if (animatedProperty.constants) {
                    const value = compute(frame);
                    if (value === animatedProperty.lastWrittenValue) {
                        continue;
                    }
                    // every queued render is applied, so the value can be considered written
                    animatedProperty.lastWrittenValue = value;
                    renders.push([object, key, value]);
                }
                else {
                    renders.push([object, key, compute(frame)]);
                }
            }
            return renders;
        }
    }
    function canScroll(overflow) {
        return overflow !== "visible" && overflow !== "clip";
    }
    function getFirstScrollParent(element) {
        if (element == null) {
            return null;
        }
        const overflowsVertically = element.scrollHeight !== element.clientHeight;
        const overflowsHorizontally = element.scrollWidth !== element.clientWidth;
        if (overflowsVertically || overflowsHorizontally) {
            // the content sticking out of an element with overflow visible or clip does not make it scroll
            const style = getComputedStyle(element);
            if ((overflowsVertically && canScroll(style.overflowY)) ||
                (overflowsHorizontally && canScroll(style.overflowX))) {
                return element;
            }
        }
        return getFirstScrollParent(element.parentElement);
    }
    class ScrollParent {
        element;
        constructor(element) {
            this.element = element;
            element[SCROLL_PARENT] = this;
        }
        refresh() {
            this._lastPosition = null;
            this._needsRefresh = true;
            return this;
        }
        _refreshParents() {
            this._needsRefresh = false;
            this._parents = [];
            let ancestor = this.element;
            while (true) {
                ancestor = getFirstScrollParent(ancestor);
                if (ancestor == null) {
                    break;
                }
                // the scroll of the document is window.scrollY, already subtracted in _getRectTop
                if (ancestor !== this.element &&
                    ancestor !== document.documentElement &&
                    ancestor !== document.scrollingElement) {
                    this._parents.push(ancestor);
                }
                ancestor = ancestor.parentElement;
            }
        }
        children = [];
        trigger = 0;
        topOffset = 0;
        bottomOffset = 0;
        _lastPosition = null;
        _needsRefresh = true;
        _parents = [];
        // offsetTop ignores the CSS transforms, unlike getBoundingClientRect:
        // an animation transforming an ancestor does not move the range it is computed on
        _getRectTop() {
            // position in the document, going up the offsetParent chain
            let top = 0;
            let element = this.element;
            while (true) {
                top += element.offsetTop;
                const offsetParent = element.offsetParent;
                // when the offsetParent is the body, offsetTop is already relative to the document
                if (offsetParent == null || offsetParent === document.body) {
                    break;
                }
                // offsetTop is relative to the padding edge of the offsetParent, not to its border
                top += offsetParent.clientTop;
                element = offsetParent;
            }
            // scroll of the ancestors
            for (let parentIndex = this._parents.length - 1; parentIndex >= 0; parentIndex--) {
                top -= this._parents[parentIndex].scrollTop;
            }
            return top - window.scrollY;
        }
        render(renders) {
            if (this.children.length === 0 || (this.element.clientHeight === 0 && this.element.clientWidth === 0)) {
                return renders;
            }
            if (this._needsRefresh) {
                this._refreshParents();
            }
            const rectTop = this._getRectTop();
            const rectBottom = rectTop + this.element.offsetHeight;
            const trigger = document.documentElement.clientHeight * this.trigger;
            const top = rectTop - this.topOffset;
            const bottom = rectBottom + this.bottomOffset;
            let actualPosition;
            if (bottom - top <= 0) {
                // empty range: avoid dividing by zero, decide only by the trigger
                actualPosition = trigger < top ? "before" : "after";
            }
            else {
                const position = (trigger - top) / (bottom - top);
                actualPosition = position > 1 ? "after" : position < 0 ? "before" : position;
            }
            if (actualPosition === this._lastPosition) {
                return renders;
            }
            this._lastPosition = actualPosition;
            for (let childIndex = this.children.length - 1; childIndex >= 0; childIndex--) {
                this.children[childIndex].render(this._lastPosition, renders);
            }
            return renders;
        }
        remove(scrollObject) {
            const index = this.children.findIndex(child => child === scrollObject || child.element === scrollObject.element);
            if (index !== -1) {
                this.children.splice(index, 1);
                this._lastPosition = null;
            }
        }
        add(scrollObject) {
            this.remove(scrollObject);
            this.children.push(scrollObject);
            this._lastPosition = null;
        }
    }
    const baseScrollParent = new ScrollParent(document.documentElement);
    document.body[SCROLL_PARENT] = baseScrollParent;
    const scrollParents = new Set();
    function applyRenders(renders) {
        for (let renderIndex = renders.length - 1; renderIndex >= 0; renderIndex--) {
            const render = renders[renderIndex];
            const result = render[2];
            const object = render[0];
            if (Array.isArray(result)) {
                object[render[1]].apply(object, result);
            }
            else {
                object[render[1]] = result;
            }
        }
    }
    function render() {
        const renders = [];
        scrollParents.forEach(scrollParent => { scrollParent.render(renders); });
        applyRenders(renders);
    }
    exports.METHOD = void 0;
    (function (METHOD) {
        // renders every frame, also when nothing moves
        METHOD[METHOD["ANIMATION_FRAME"] = 0] = "ANIMATION_FRAME";
        // renders only after scroll, resize of the window or resize of a parent or of the document
        METHOD[METHOD["EVENTS"] = 1] = "EVENTS";
    })(exports.METHOD || (exports.METHOD = {}));
    let method = exports.METHOD.ANIMATION_FRAME;
    let started = false;
    let animationFrameId = null;
    let resizeObserver = null;
    // scroll does not bubble: capture catches also the scroll of inner containers
    const scrollListenerOptions = { capture: true, passive: true };
    const resizeObserverOptions = { box: "border-box" };
    function observe(scrollParent) {
        if (resizeObserver != null) {
            resizeObserver.observe(scrollParent.element, resizeObserverOptions);
        }
    }
    function unobserve(scrollParent) {
        // the document element stays observed, its size changes when the content above any parent changes
        if (resizeObserver != null && scrollParent.element !== document.documentElement) {
            resizeObserver.unobserve(scrollParent.element);
        }
    }
    function addScrollParent(scrollParent) {
        scrollParents.add(scrollParent);
        observe(scrollParent);
    }
    function deleteScrollParent(scrollParent) {
        if (scrollParents.delete(scrollParent)) {
            unobserve(scrollParent);
        }
    }
    function startLoop() {
        if (started) {
            return;
        }
        started = true;
        if (method === exports.METHOD.ANIMATION_FRAME) {
            animationFrameId = requestAnimationFrame(function loop() {
                render();
                animationFrameId = requestAnimationFrame(loop);
            });
            return;
        }
        window.addEventListener("scroll", requestRender, scrollListenerOptions);
        window.addEventListener("resize", requestRender);
        resizeObserver = new ResizeObserver(requestRender);
        resizeObserver.observe(document.documentElement, resizeObserverOptions);
        scrollParents.forEach(observe);
        requestRender();
    }
    function endLoop() {
        if (!started) {
            return;
        }
        started = false;
        if (animationFrameId != null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (method === exports.METHOD.EVENTS) {
            window.removeEventListener("scroll", requestRender, scrollListenerOptions);
            window.removeEventListener("resize", requestRender);
            resizeObserver.disconnect();
            resizeObserver = null;
        }
    }
    /**
     * Schedules a render on the next frame. With `METHOD.EVENTS` it is needed when a parent moves
     * without scrolling and without any resize of the parent itself or of the document,
     * with `METHOD.ANIMATION_FRAME` it does nothing because every frame is rendered.
     */
    function requestRender() {
        if (!started || method !== exports.METHOD.EVENTS || animationFrameId != null) {
            return;
        }
        animationFrameId = requestAnimationFrame(() => {
            animationFrameId = null;
            render();
        });
    }
    function setMethod(value) {
        if (value !== exports.METHOD.ANIMATION_FRAME && value !== exports.METHOD.EVENTS) {
            throw new TypeError("invalid method");
        }
        if (value === method) {
            return;
        }
        const wasStarted = started;
        endLoop();
        method = value;
        if (wasStarted) {
            startLoop();
        }
    }
    function getRefreshedParent(element) {
        // an animated element stores the parent it belongs to, which is an ancestor's:
        // reuse it only if it is the element's own
        if (element[SCROLL_PARENT] && element[SCROLL_PARENT].element === element) {
            return element[SCROLL_PARENT].refresh();
        }
        const parent = new ScrollParent(element);
        addScrollParent(parent);
        return parent;
    }
    function parse(element, parent, subtree = true) {
        let scrollOptions = null;
        const extrapolatedKeys = {};
        for (const attribute of element.attributes) {
            if (!attribute.name.startsWith("data-scroll-") && !attribute.name.startsWith("data-scroll.")) {
                continue;
            }
            const data = attribute.name.slice(11);
            if (data === "-parent") {
                parent = getRefreshedParent(element);
            }
            else if (data === "-trigger") {
                let trigger = parseFloat(attribute.value);
                if (!isNaN(trigger)) {
                    parent = getRefreshedParent(element);
                    parent.trigger = trigger;
                }
            }
            else if (data === "-bottom") {
                let bottom = parseFloat(attribute.value);
                if (!isNaN(bottom)) {
                    parent = getRefreshedParent(element);
                    parent.bottomOffset = bottom;
                }
            }
            else if (data === "-top") {
                let top = parseFloat(attribute.value);
                if (!isNaN(top)) {
                    parent = getRefreshedParent(element);
                    parent.topOffset = top;
                }
            }
            else {
                const dataSplit = data.split("-");
                dataSplit.shift();
                if (dataSplit.length > 2 || dataSplit.length === 0) {
                    continue;
                }
                if (scrollOptions == null) {
                    scrollOptions = {};
                }
                // convert "_[a-z]" to "[A-Z]" and "__" to "_"
                const propertyName = dataSplit[0].replace(/_(_|[a-z])/g, function (match, nextCharacter) {
                    return nextCharacter === "_" ? "_" : nextCharacter.toUpperCase();
                });
                if (dataSplit.length === 1 && dataSplit[0].match(/(.*)\(\)$/)) {
                    scrollOptions[propertyName] = [];
                }
                else {
                    const frameName = dataSplit[1];
                    const frame = parseFloat(frameName);
                    let position;
                    if (!isNaN(frame)) {
                        position = frame;
                    }
                    else if (frameName === "before" || frameName === "after") {
                        position = frameName;
                    }
                    else if (frameName === "extrapolate") {
                        // the attribute value is ignored
                        extrapolatedKeys[propertyName] = true;
                        continue;
                    }
                    else {
                        continue;
                    }
                    (scrollOptions[propertyName] = scrollOptions[propertyName] || []).push([position, attribute.value]);
                }
            }
        }
        if (scrollOptions != null) {
            const previousParent = element[SCROLL_PARENT];
            let scrollObject = element[SCROLL_OBJECT];
            if (scrollObject != null && previousParent != null && previousParent !== parent) {
                previousParent.remove(scrollObject);
            }
            // ScrollObject.refresh refreshes element[SCROLL_PARENT], so the new parent must be set first
            element[SCROLL_PARENT] = parent;
            if (scrollObject != null) {
                scrollObject.refresh(scrollOptions, extrapolatedKeys);
            }
            else {
                scrollObject = new ScrollObject(element, scrollOptions, extrapolatedKeys);
            }
            parent.add(scrollObject);
        }
        if (subtree) {
            for (const child of element.children) {
                parse(child, parent);
            }
        }
    }
    function add(element, subtree = true) {
        let parent = element;
        let firstScrollParent = element[SCROLL_PARENT];
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
    function remove(element, renderFrame = null) {
        let scrollParent = element[SCROLL_PARENT];
        let scrollObject = element[SCROLL_OBJECT];
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
            remove(child, renderFrame);
        }
        if (scrollParent === baseScrollParent && baseScrollParent.children.length === 0) {
            deleteScrollParent(baseScrollParent);
        }
        if (scrollParents.size === 0) {
            endLoop();
        }
    }

    exports.add = add;
    exports.remove = remove;
    exports.requestRender = requestRender;
    exports.setMethod = setMethod;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
