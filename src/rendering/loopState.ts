import METHOD from "./METHOD";

const loopState: {
    method: METHOD,
    started: boolean,
    animationFrameId: number | null,
    resizeObserver: ResizeObserver | null
} = {
    method: METHOD.ANIMATION_FRAME,
    started: false,
    animationFrameId: null,
    resizeObserver: null
};

export default loopState;
