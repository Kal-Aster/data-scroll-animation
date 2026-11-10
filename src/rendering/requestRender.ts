import loopState from "./loopState";
import METHOD from "./METHOD";
import renderScrollParents from "./renderScrollParents";

/**
 * Schedules a render on the next frame. With `METHOD.EVENTS` it is needed when a parent moves
 * without scrolling and without any resize of the parent itself or of the document,
 * with `METHOD.ANIMATION_FRAME` it does nothing because every frame is rendered.
 */
export default function requestRender(): void {
    if (!loopState.started || loopState.method !== METHOD.EVENTS || loopState.animationFrameId != null) {
        return;
    }
    loopState.animationFrameId = requestAnimationFrame(() => {
        loopState.animationFrameId = null;
        renderScrollParents();
    });
}
