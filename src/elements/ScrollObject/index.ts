import frames from "../../frames";
import math from "../../math";
import rendering from "../../rendering";
import symbols from "../../symbols";

import canSkipRender from "./canSkipRender";
import createAnimatedProperty from "./createAnimatedProperty";

import AnimatedProperty from "./types/AnimatedProperty";

export default class ScrollObject {
    constructor(
        readonly element: HTMLElement,
        keyframesByKey: { [key: string]: frames.Keyframe[] },
        optionsByKey: { [key: string]: frames.InterpolationOptions } = {}
    ) {
        this.refresh(keyframesByKey, optionsByKey);
    }
    refresh(
        keyframesByKey: { [key: string]: frames.Keyframe[] },
        optionsByKey: { [key: string]: frames.InterpolationOptions } = {}
    ): ScrollObject {
        this.element[symbols.SCROLL_OBJECT] = this;
        this._frames = [];
        for (let key in keyframesByKey) {
            if (!Object.prototype.hasOwnProperty.call(keyframesByKey, key)) {
                continue;
            }
            const animatedProperty = createAnimatedProperty(this.element, key, keyframesByKey[key], optionsByKey[key] ?? {});
            if (animatedProperty == null) {
                continue;
            }
            this._frames.push(animatedProperty);

            const needUpdateAt: frames.NeedUpdateAt = animatedProperty.needUpdateAt;
            this._needUpdateAt.before = this._needUpdateAt.before || needUpdateAt.before;
            this._needUpdateAt.start = math.nullableMin(this._needUpdateAt.start, needUpdateAt.start);
            this._needUpdateAt.end = math.nullableMax(this._needUpdateAt.end, needUpdateAt.end);
            this._needUpdateAt.after = this._needUpdateAt.after || needUpdateAt.after;
        }
        this._lastRenderFrame = null;
        this.element[symbols.SCROLL_PARENT]!.refresh();
        return this;
    }
    _needUpdateAt: frames.NeedUpdateAt = { before: false, start: null, end: null, after: false };
    _frames: AnimatedProperty[] = [];
    _lastRenderFrame: frames.FramePosition | null = null;
    render(frame: frames.FramePosition, renders: rendering.Render[], force: boolean = false): rendering.Render[] {
        if (!force &&
            this._lastRenderFrame === frame
        ) {
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
            } else if (isFunction) {
                renders.push([object, key, [
                    frame,
                    ...compute(frame).split(",").map(argument => argument.trim()).filter(argument => argument !== "")
                ]]);
            } else if (animatedProperty.constants) {
                const value = compute(frame);
                if (value === animatedProperty.lastWrittenValue) {
                    continue;
                }
                // every queued render is applied, so the value can be considered written
                animatedProperty.lastWrittenValue = value;
                renders.push([object, key, value]);
            } else {
                renders.push([object, key, compute(frame)]);
            }
        }
        return renders;
    }
}
