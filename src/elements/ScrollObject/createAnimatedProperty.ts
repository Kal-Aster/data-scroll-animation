import frames from "../../frames";
import type AnimatedProperty from "./AnimatedProperty";

// "style.top" animates the top of element.style, "method()" calls element.method:
// null when the key is not valid
export default function createAnimatedProperty(
    element: HTMLElement,
    key: string,
    keyframes: frames.Keyframe[],
    extrapolate: boolean
): AnimatedProperty | null {
    const splitKey: string[] = key.split(".");
    const [isValid, lastKey, isFunction] = splitKey.pop()!.match(/^([^\(\)]*)(\(\))?$/) || [];
    if (!isValid) {
        return null;
    }
    const hasFrames: boolean = keyframes.length > 0;
    const { compute, needUpdateAt, constants } = frames.computeFrames(keyframes, extrapolate);
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
    const accessor: AnimatedProperty["accessor"] = () => {
        let lastObject: any = element;
        for (let keyIndex = 0; keyIndex < keyLength; keyIndex++) {
            if (lastObject == null) {
                return null;
            }
            lastObject = lastObject[splitKey[keyIndex]];
        }
        return lastObject;
    };
    return {
        accessor,
        key: lastKey,
        isFunction: isFunction != null,
        compute: isFunction && !hasFrames ? null : compute,
        needUpdateAt,
        constants,
        lastWrittenValue: null
    };
}
