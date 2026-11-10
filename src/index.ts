import add from "./add";
import remove from "./remove";
import rendering from "./rendering";

export { add, remove };
// enums are values and types: both are exported
export const METHOD = rendering.METHOD;
export type METHOD = rendering.METHOD;
export const requestRender = rendering.requestRender;
export const setMethod = rendering.setMethod;
