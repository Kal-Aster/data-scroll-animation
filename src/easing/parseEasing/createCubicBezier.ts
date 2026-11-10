import Easing from "../types/Easing";

const NEWTON_ITERATIONS: number = 8;
const BISECTION_ITERATIONS: number = 32;
const PRECISION: number = 1e-7;

// the curve starts at (0, 0) and ends at (1, 1): x is the progress, y the eased progress
export default function createCubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
    const curve = (first: number, second: number, parameter: number): number => {
        const inverse: number = 1 - parameter;
        return 3 * inverse * inverse * parameter * first + 3 * inverse * parameter * parameter * second + parameter * parameter * parameter;
    };
    const curveSlope = (first: number, second: number, parameter: number): number => {
        const inverse: number = 1 - parameter;
        return 3 * inverse * inverse * first + 6 * inverse * parameter * (second - first) + 3 * parameter * parameter * (1 - second);
    };
    // parameter of the curve where x is the progress: x grows with the parameter, since x1 and x2 are in [0, 1]
    const solveParameter = (progress: number): number => {
        let parameter: number = progress;
        for (let iteration = 0; iteration < NEWTON_ITERATIONS; iteration++) {
            const error: number = curve(x1, x2, parameter) - progress;
            if (Math.abs(error) < PRECISION) {
                return parameter;
            }
            const slope: number = curveSlope(x1, x2, parameter);
            if (Math.abs(slope) < PRECISION) {
                break;
            }
            parameter -= error / slope;
        }
        // Newton's method didn't converge, typically where the curve is flat
        let lower: number = 0;
        let upper: number = 1;
        parameter = progress;
        for (let iteration = 0; iteration < BISECTION_ITERATIONS; iteration++) {
            const curveX: number = curve(x1, x2, parameter);
            if (Math.abs(curveX - progress) < PRECISION) {
                break;
            }
            if (curveX < progress) {
                lower = parameter;
            } else {
                upper = parameter;
            }
            parameter = (lower + upper) / 2;
        }
        return parameter;
    };
    return (progress: number) => {
        if (progress <= 0 || progress >= 1) {
            return progress;
        }
        return curve(y1, y2, solveParameter(progress));
    };
}
