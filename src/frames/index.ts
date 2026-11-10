import _computeFrames from "./computeFrames";

import _FramePosition from "./types/FramePosition";
import _InterpolationOptions from "./types/InterpolationOptions";
import _Keyframe from "./types/Keyframe";
import _NeedUpdateAt from "./types/NeedUpdateAt";

namespace frames {
    export const computeFrames = _computeFrames;

    export type FramePosition = _FramePosition;
    export type InterpolationOptions = _InterpolationOptions;
    export type Keyframe = _Keyframe;
    export type NeedUpdateAt = _NeedUpdateAt;
}

export default frames;
