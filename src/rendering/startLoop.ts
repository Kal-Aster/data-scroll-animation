import loopState from "./loopState";
import observe from "./observe";
import renderScrollParents from "./renderScrollParents";
import requestRender from "./requestRender";
import resizeObserverOptions from "./resizeObserverOptions";
import scrollListenerOptions from "./scrollListenerOptions";
import scrollParents from "./scrollParents";

import METHOD from "./enums/METHOD";

export default function startLoop(): void {
    if (loopState.started) {
        return;
    }
    loopState.started = true;
    if (loopState.method === METHOD.ANIMATION_FRAME) {
        loopState.animationFrameId = requestAnimationFrame(function loop(): void {
            renderScrollParents();
            loopState.animationFrameId = requestAnimationFrame(loop);
        });
        return;
    }
    window.addEventListener("scroll", requestRender, scrollListenerOptions);
    window.addEventListener("resize", requestRender);
    loopState.resizeObserver = new ResizeObserver(requestRender);
    loopState.resizeObserver.observe(document.documentElement, resizeObserverOptions);
    scrollParents.forEach(observe);
    requestRender();
}
