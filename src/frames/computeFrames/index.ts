import math from "../../math";
import type FramePosition from "../FramePosition";
import type Keyframe from "../Keyframe";
import type NeedUpdateAt from "../NeedUpdateAt";
import compareKeyframePositions from "./compareKeyframePositions";
import createBeforeAfterCompute from "./createBeforeAfterCompute";
import createConstantCompute from "./createConstantCompute";
import createInterpolatedCompute from "./createInterpolatedCompute";
import haveSameShape from "./haveSameShape";
import parseKeyframeValue from "./parseKeyframeValue";

// constants: the computed value only changes when passing from a keyframe to another
export default function computeFrames(frames: Keyframe[], extrapolate: boolean = false): {
    compute: (frame: FramePosition) => string,
    needUpdateAt: NeedUpdateAt,
    constants: boolean
 } {
    // fixed parts of the first keyframe: the keyframes are interpolated only if they all match it
    let shape: string[] | null = null;
    const frameNumbers: number[] = [];
    const frameValues: number[][] = [];
    let beforeValue: string | null = null;
    let afterValue: string | null = null;
    const needUpdateAt: NeedUpdateAt = { before: false, start: null, end: null, after: false };
    let constants: boolean = false;
    frames.sort(compareKeyframePositions);
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
        needUpdateAt.start = math.nullableMin(needUpdateAt.start, frame[0]);
        needUpdateAt.end = math.nullableMax(needUpdateAt.end, frame[0]);
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
        return {
            compute: createConstantCompute(frames, frameNumbers, beforeValue, afterValue),
            needUpdateAt,
            constants: true
        };
    }
    if (frameValues.length === 0) {
        return {
            compute: createBeforeAfterCompute(beforeValue, afterValue),
            needUpdateAt: { before: needUpdateAt.before, start: null, end: null, after: needUpdateAt.after },
            constants: true
        };
    }
    // extrapolating needs a segment to extend, otherwise the flag is ignored
    const extrapolating: boolean = extrapolate && frameNumbers.length >= 2;
    if (extrapolating) {
        // values change over the whole range, not only between the keyframes
        needUpdateAt.start = 0;
        needUpdateAt.end = 1;
    }
    return {
        compute: createInterpolatedCompute(shape!, frameNumbers, frameValues, beforeValue, afterValue, extrapolating),
        needUpdateAt,
        constants: false
    };
}
