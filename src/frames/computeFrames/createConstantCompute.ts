import FramePosition from "../FramePosition";
import Keyframe from "../Keyframe";
import getNearestLeftIndex from "./getNearestLeftIndex";

export default function createConstantCompute(
    frames: Keyframe[],
    frameNumbers: number[],
    beforeValue: string | null,
    afterValue: string | null
): (frame: FramePosition) => string {
    // without before/after keep the first/last keyframe: the sort puts before and after
    // after the keyframes, so the last keyframe is at frameNumbers.length - 1
    const constantBeforeValue: string = beforeValue ?? frames[0][1];
    const constantAfterValue: string = afterValue ?? frames[frameNumbers.length - 1][1];
    return (frameNumber: FramePosition) => {
        if (frameNumber === "before") {
            return constantBeforeValue;
        } else if (frameNumber === "after") {
            return constantAfterValue;
        }
        const index: number = getNearestLeftIndex(frameNumbers, frameNumber);
        if (index === -1) {
            return "";
        }
        return frames[index][1];
    };
}
