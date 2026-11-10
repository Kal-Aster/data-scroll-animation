type FramePosition = number | "before" | "after";
type Keyframe = [position: FramePosition, value: string];
type NeedUpdateAt = {
    before: boolean;
    start: number | null;
    end: number | null;
    after: boolean;
};
type Render = [target: any, key: string, value: string | unknown[]];
type Accessor = () => any;
type AnimatedProperty = {
    accessor: Accessor;
    key: string;
    isFunction: boolean;
    compute: ((frame: FramePosition) => string) | null;
    needUpdateAt: NeedUpdateAt;
    constants: boolean;
    lastWrittenValue: string | null;
};
declare const SCROLL_OBJECT: unique symbol;
declare const SCROLL_PARENT: unique symbol;
declare global {
    interface HTMLElement {
        [SCROLL_OBJECT]: ScrollObject | undefined;
        [SCROLL_PARENT]: ScrollParent | undefined;
    }
}
declare class ScrollObject {
    readonly element: HTMLElement;
    constructor(element: HTMLElement, frames: {
        [key: string]: Keyframe[];
    }, extrapolatedKeys?: {
        [key: string]: boolean;
    });
    refresh(frames: {
        [key: string]: Keyframe[];
    }, extrapolatedKeys?: {
        [key: string]: boolean;
    }): ScrollObject;
    _needUpdateAt: NeedUpdateAt;
    _frames: AnimatedProperty[];
    _lastRenderFrame: FramePosition | null;
    render(frame: FramePosition, renders: Render[], force?: boolean): Render[];
}
declare class ScrollParent {
    readonly element: HTMLElement;
    constructor(element: HTMLElement);
    refresh(): ScrollParent;
    _refreshParents(): void;
    children: ScrollObject[];
    trigger: number;
    topOffset: number;
    bottomOffset: number;
    _lastPosition: FramePosition | null;
    _needsRefresh: boolean;
    _parents: HTMLElement[];
    _getRectTop(): number;
    render(renders: Render[]): Render[];
    remove(scrollObject: ScrollObject): void;
    add(scrollObject: ScrollObject): void;
}
export declare enum METHOD {
    ANIMATION_FRAME = 0,
    EVENTS = 1
}
/**
 * Schedules a render on the next frame. With `METHOD.EVENTS` it is needed when a parent moves
 * without scrolling and without any resize of the parent itself or of the document,
 * with `METHOD.ANIMATION_FRAME` it does nothing because every frame is rendered.
 */
export declare function requestRender(): void;
export declare function setMethod(value: METHOD): void;
export declare function add(element: HTMLElement, subtree?: boolean): void;
export declare function remove(element: HTMLElement, renderFrame?: FramePosition | null): void;
export {};
