import Easing from "../types/Easing";
import StepPosition from "../types/StepPosition";

// same as the CSS steps() function: the progress is divided into stepCount intervals and position
// says whether the jumps happen at their start, at their end, at neither or at both
export default function createSteps(stepCount: number, position: StepPosition): Easing {
    const jumpCount: number =
        position === "jump-none" ? stepCount - 1 :
        position === "jump-both" ? stepCount + 1 :
        stepCount;
    const jumpsAtStart: boolean = position === "jump-start" || position === "jump-both";
    return (progress: number) => {
        let currentStep: number = Math.floor(progress * stepCount);
        if (jumpsAtStart) {
            currentStep++;
        }
        currentStep = Math.min(Math.max(0, currentStep), jumpCount);
        return currentStep / jumpCount;
    };
}
