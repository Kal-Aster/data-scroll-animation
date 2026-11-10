import loopState from "./loopState";
import requestRender from "./requestRender";
import scrollListenerOptions from "./scrollListenerOptions";

import METHOD from "./enums/METHOD";

export default function endLoop(): void {
    if (!loopState.started) {
        return;
    }
    loopState.started = false;
    if (loopState.animationFrameId != null) {
        cancelAnimationFrame(loopState.animationFrameId);
        loopState.animationFrameId = null;
    }
    if (loopState.method === METHOD.EVENTS) {
        window.removeEventListener("scroll", requestRender, scrollListenerOptions);
        window.removeEventListener("resize", requestRender);
        loopState.resizeObserver!.disconnect();
        loopState.resizeObserver = null;
    }
}
