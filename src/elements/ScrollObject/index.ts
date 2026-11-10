import type { FramePosition, Keyframe, NeedUpdateAt } from "../../frames";
import { nullableMax, nullableMin } from "../../math";
import type { Render } from "../../rendering";
import { SCROLL_OBJECT, SCROLL_PARENT } from "../../symbols";
import type AnimatedProperty from "./AnimatedProperty";
import canSkipRender from "./canSkipRender";
import createAnimatedProperty from "./createAnimatedProperty";

export default class ScrollObject {
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
            const animatedProperty = createAnimatedProperty(this.element, key, frames[key], extrapolatedKeys[key] === true);
            if (animatedProperty == null) {
                continue;
            }
            this._frames.push(animatedProperty);

            const needUpdateAt: NeedUpdateAt = animatedProperty.needUpdateAt;
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
