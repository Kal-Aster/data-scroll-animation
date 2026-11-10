import _addScrollParent from "./addScrollParent";
import _applyRenders from "./applyRenders";
import _deleteScrollParent from "./deleteScrollParent";
import _endLoop from "./endLoop";
import _METHOD from "./METHOD";
import _Render from "./Render";
import _requestRender from "./requestRender";
import _scrollParents from "./scrollParents";
import _setMethod from "./setMethod";
import _startLoop from "./startLoop";

namespace rendering {
    export const addScrollParent = _addScrollParent;
    export const applyRenders = _applyRenders;
    export const deleteScrollParent = _deleteScrollParent;
    export const endLoop = _endLoop;
    export const METHOD = _METHOD;
    export type METHOD = _METHOD;
    export type Render = _Render;
    export const requestRender = _requestRender;
    export const scrollParents = _scrollParents;
    export const setMethod = _setMethod;
    export const startLoop = _startLoop;
}

export default rendering;
