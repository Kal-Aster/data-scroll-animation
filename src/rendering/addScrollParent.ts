import type { ScrollParent } from "../parents";
import observe from "./observe";
import scrollParents from "./scrollParents";

export default function addScrollParent(scrollParent: ScrollParent): void {
    scrollParents.add(scrollParent);
    observe(scrollParent);
}
