import _parseEasing from "./parseEasing";

import _Easing from "./types/Easing";

namespace easing {
    export const parseEasing = _parseEasing;

    export type Easing = _Easing;
}

export default easing;
