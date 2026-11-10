import METHOD from "./METHOD";

// state of the render loop, shared by the functions that start, stop and drive it
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
