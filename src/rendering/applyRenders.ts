import Render from "./Render";

export default function applyRenders(renders: Render[]): void {
    for (let renderIndex = renders.length - 1; renderIndex >= 0; renderIndex--) {
        const render = renders[renderIndex];
        const result = render[2];
        const object = render[0];
        if (Array.isArray(result)) {
            object[render[1]].apply(object, result);
        } else {
            object[render[1]] = result;
        }
    }
}
