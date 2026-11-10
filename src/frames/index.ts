import computeFramesDefault from "./computeFrames";
import type FramePositionDefault from "./FramePosition";
import type KeyframeDefault from "./Keyframe";
import type NeedUpdateAtDefault from "./NeedUpdateAt";

namespace frames {
    export const computeFrames = computeFramesDefault;
    export type FramePosition = FramePositionDefault;
    export type Keyframe = KeyframeDefault;
    export type NeedUpdateAt = NeedUpdateAtDefault;
}

export default frames;
