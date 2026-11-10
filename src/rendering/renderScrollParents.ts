import applyRenders from "./applyRenders";
import type Render from "./Render";
import scrollParents from "./scrollParents";

export default function renderScrollParents(): void {
    const renders: Render[] = [];
    scrollParents.forEach(scrollParent => { scrollParent.render(renders); });
    applyRenders(renders);
}
