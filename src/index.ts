import _add from "./add";
import _remove from "./remove";
import rendering from "./rendering";

namespace dataScrollAnimation {
    export const add = _add;
    export const remove = _remove;
    export const METHOD = rendering.METHOD;
    export type METHOD = rendering.METHOD;
    export const requestRender = rendering.requestRender;
    export const setMethod = rendering.setMethod;
}

export default dataScrollAnimation;
