import applyRenders from "./applyRenders";
import scrollParents from "./scrollParents";

import Render from "./types/Render";

export default function renderScrollParents(): void {
    const renders: Render[] = [];
    scrollParents.forEach(scrollParent => { scrollParent.render(renders); });
    applyRenders(renders);
}
