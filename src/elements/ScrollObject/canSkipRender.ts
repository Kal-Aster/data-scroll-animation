import frames from "../../frames";

// the value doesn't change between the last rendered frame and this one
// when both are outside the update range on the same side
export default function canSkipRender(
    frame: frames.FramePosition,
    lastRenderFrame: frames.FramePosition | null,
    needUpdateAt: frames.NeedUpdateAt
): boolean {
    return (
        lastRenderFrame != null &&
        frame !== "before" && frame !== "after" &&
        lastRenderFrame !== "before" &&
        lastRenderFrame !== "after" &&
        (
            needUpdateAt.start == null || needUpdateAt.end == null ||
            (frame < needUpdateAt.start && lastRenderFrame < needUpdateAt.start) ||
            (frame > needUpdateAt.end && lastRenderFrame > needUpdateAt.end)
        )
    );
}
