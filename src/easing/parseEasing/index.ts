import Easing from "../types/Easing";
import StepPosition from "../types/StepPosition";

import createCubicBezier from "./createCubicBezier";
import createSteps from "./createSteps";

const NUMBER: string = "\\s*([-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?)\\s*";
const CUBIC_BEZIER_PATTERN: RegExp = new RegExp(`^cubic-bezier\\(${NUMBER},${NUMBER},${NUMBER},${NUMBER}\\)$`);
const STEPS_PATTERN: RegExp = /^steps\(\s*(\d+)\s*(?:,\s*(jump-start|jump-end|jump-none|jump-both|start|end)\s*)?\)$/;

const KEYWORDS: { [keyword: string]: Easing } = {
    "linear": (progress: number) => progress,
    "ease": createCubicBezier(0.25, 0.1, 0.25, 1),
    "ease-in": createCubicBezier(0.42, 0, 1, 1),
    "ease-out": createCubicBezier(0, 0, 0.58, 1),
    "ease-in-out": createCubicBezier(0.42, 0, 0.58, 1),
    "step-start": createSteps(1, "jump-start"),
    "step-end": createSteps(1, "jump-end")
};

// accepts the CSS easing functions except linear() with points: null when the value is not valid
export default function parseEasing(value: string): Easing | null {
    const normalizedValue: string = value.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(KEYWORDS, normalizedValue)) {
        return KEYWORDS[normalizedValue];
    }
    const cubicBezierMatch: RegExpMatchArray | null = normalizedValue.match(CUBIC_BEZIER_PATTERN);
    if (cubicBezierMatch != null) {
        const [x1, y1, x2, y2] = cubicBezierMatch.slice(1).map(parseFloat);
        if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) {
            return null;
        }
        return createCubicBezier(x1, y1, x2, y2);
    }
    const stepsMatch: RegExpMatchArray | null = normalizedValue.match(STEPS_PATTERN);
    if (stepsMatch != null) {
        const stepCount: number = parseInt(stepsMatch[1], 10);
        const keyword: string = stepsMatch[2] ?? "jump-end";
        const position: StepPosition = keyword === "start" ? "jump-start" : keyword === "end" ? "jump-end" : keyword as StepPosition;
        if (stepCount < 1 || (position === "jump-none" && stepCount < 2)) {
            return null;
        }
        return createSteps(stepCount, position);
    }
    return null;
}
