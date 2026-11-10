// index of the last keyframe at or before frameNumber, the first one if frameNumber comes before all of them
export default function getNearestLeftIndex(frameNumbers: number[], frameNumber: number): number {
    if (frameNumbers.length === 0) {
        return -1;
    }
    let leftIndex: number = 0;
    for (let index: number = 1; index < frameNumbers.length; index++) {
        if (frameNumbers[index] > frameNumber) {
            break;
        }
        leftIndex = index;
    }
    return leftIndex;
}
