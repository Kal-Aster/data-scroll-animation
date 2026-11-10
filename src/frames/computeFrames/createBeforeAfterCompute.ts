import FramePosition from "../FramePosition";

// for keys with only the "before" and "after" values and no numeric keyframe
export default function createBeforeAfterCompute(beforeValue: string | null, afterValue: string | null): (frame: FramePosition) => string {
    return (frameNumber: FramePosition) => {
        if (frameNumber === "before" && beforeValue != null) {
            return beforeValue;
        } else if (frameNumber === "after" && afterValue != null) {
            return afterValue;
        }
        return "";
    };
}
