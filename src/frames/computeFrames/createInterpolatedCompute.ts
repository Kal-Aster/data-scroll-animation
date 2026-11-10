import FramePosition from "../types/FramePosition";

import getNearestLeftIndex from "./getNearestLeftIndex";

// every interpolated keyframe has the same shape, so it has staticParts.length - 1 values
function constructString(staticParts: string[], values: number[], nextValues: number[] | null, percentage: number): string {
    const valuesLength: number = staticParts.length - 1;
    let constructedString: string = staticParts[0];
    for (let valueIndex = 0; valueIndex < valuesLength; valueIndex++) {
        let value: number = values[valueIndex];
        if (nextValues !== null) {
            // rounded to 4 decimals so that close scroll positions give the same string and the browser
            // skips recalculating the style; toFixed is avoided because it adds trailing zeros
            value = Math.round((value + ((nextValues[valueIndex] - value) * percentage)) * 10000) / 10000;
        }
        constructedString += value.toString() + staticParts[valueIndex + 1];
    }
    return constructedString;
}

export default function createInterpolatedCompute(
    shape: string[],
    frameNumbers: number[],
    frameValues: number[][],
    beforeValue: string | null,
    afterValue: string | null,
    extrapolating: boolean
): (frame: FramePosition) => string {
    return (frameNumber: FramePosition) => {
        if (frameNumber === "before") {
            if (beforeValue != null) {
                return beforeValue;
            }
            return constructString(shape, frameValues[0], null, 0);
        } else if (frameNumber === "after") {
            if (afterValue != null) {
                return afterValue;
            }
            return constructString(shape, frameValues[frameValues.length - 1], null, 0);
        }
        frameNumber = Math.min(Math.max(0, frameNumber), 1);
        let index: number = getNearestLeftIndex(frameNumbers, frameNumber);
        if (index === -1) {
            return "";
        }
        if (frameNumber < frameNumbers[0]) {
            // before the first keyframe: keep the first value or extend the first segment
            if (!extrapolating) {
                return constructString(shape, frameValues[0], null, 0);
            }
        } else if (index === frameNumbers.length - 1) {
            // after the last keyframe: keep the last value or extend the last segment
            if (!extrapolating) {
                return constructString(shape, frameValues[index], null, 0);
            }
            index--;
        }
        const left: number = frameNumbers[index];
        const right: number = frameNumbers[index + 1];
        const progress: number = (frameNumber-left)/(right-left);
        return constructString(shape, frameValues[index], frameValues[index + 1], progress);
    };
}
