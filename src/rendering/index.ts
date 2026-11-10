import addScrollParentDefault from "./addScrollParent";
import applyRendersDefault from "./applyRenders";
import deleteScrollParentDefault from "./deleteScrollParent";
import endLoopDefault from "./endLoop";
import METHODDefault from "./METHOD";
import type RenderDefault from "./Render";
import requestRenderDefault from "./requestRender";
import scrollParentsDefault from "./scrollParents";
import setMethodDefault from "./setMethod";
import startLoopDefault from "./startLoop";

namespace rendering {
    export const addScrollParent = addScrollParentDefault;
    export const applyRenders = applyRendersDefault;
    export const deleteScrollParent = deleteScrollParentDefault;
    export const endLoop = endLoopDefault;
    // enums are values and types: both are exported
    export const METHOD = METHODDefault;
    export type METHOD = METHODDefault;
    export type Render = RenderDefault;
    export const requestRender = requestRenderDefault;
    export const scrollParents = scrollParentsDefault;
    export const setMethod = setMethodDefault;
    export const startLoop = startLoopDefault;
}

export default rendering;
