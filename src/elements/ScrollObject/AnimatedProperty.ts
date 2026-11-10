import type frames from "../../frames";

type AnimatedProperty = {
    // object owning the property, null when the path to it is broken
    accessor: () => any,
    key: string,
    isFunction: boolean,
    // null for the functions without keyframes
    compute: ((frame: frames.FramePosition) => string) | null,
    needUpdateAt: frames.NeedUpdateAt,
    constants: boolean,
    // last value queued for the constants keys, it's reset on refresh as the properties are rebuilt
    lastWrittenValue: string | null
};

export type { AnimatedProperty as default };
