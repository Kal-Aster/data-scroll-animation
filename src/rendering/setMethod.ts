import endLoop from "./endLoop";
import loopState from "./loopState";
import startLoop from "./startLoop";

import METHOD from "./enums/METHOD";

export default function setMethod(value: METHOD): void {
    if (value !== METHOD.ANIMATION_FRAME && value !== METHOD.EVENTS) {
        throw new TypeError("invalid method");
    }
    if (value === loopState.method) {
        return;
    }
    const wasStarted: boolean = loopState.started;
    endLoop();
    loopState.method = value;
    if (wasStarted) {
        startLoop();
    }
}
