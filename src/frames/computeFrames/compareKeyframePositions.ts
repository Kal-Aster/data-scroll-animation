import Keyframe from "../Keyframe";

// numeric keyframes in ascending order, then "before" and "after"
export default function compareKeyframePositions(firstFrame: Keyframe, secondFrame: Keyframe): number {
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
}
