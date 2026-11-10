import METHOD from "./enums/METHOD";

const loopState: {
    method: METHOD,
    started: boolean,
    animationFrameId: number | null,
    resizeObserver: ResizeObserver | null
} = {
    method: METHOD.EVENTS,
    started: false,
    animationFrameId: null,
    resizeObserver: null
};

export default loopState;
