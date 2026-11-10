import Easing from "../types/Easing";

// the functions of https://easings.net, named in kebab-case

const BACK_OVERSHOOT: number = 1.70158;
const BACK_IN_OUT_OVERSHOOT: number = BACK_OVERSHOOT * 1.525;
const ELASTIC_PERIOD: number = (2 * Math.PI) / 3;
const ELASTIC_IN_OUT_PERIOD: number = (2 * Math.PI) / 4.5;
const BOUNCE_STRENGTH: number = 7.5625;
const BOUNCE_LENGTH: number = 2.75;

function easeOutBounce(progress: number): number {
    if (progress < 1 / BOUNCE_LENGTH) {
        return BOUNCE_STRENGTH * progress * progress;
    } else if (progress < 2 / BOUNCE_LENGTH) {
        progress -= 1.5 / BOUNCE_LENGTH;
        return BOUNCE_STRENGTH * progress * progress + 0.75;
    } else if (progress < 2.5 / BOUNCE_LENGTH) {
        progress -= 2.25 / BOUNCE_LENGTH;
        return BOUNCE_STRENGTH * progress * progress + 0.9375;
    }
    progress -= 2.625 / BOUNCE_LENGTH;
    return BOUNCE_STRENGTH * progress * progress + 0.984375;
}

const namedEasings: { [name: string]: Easing } = {
    "linear": (progress) => progress,

    "ease-in-sine": (progress) => 1 - Math.cos((progress * Math.PI) / 2),
    "ease-out-sine": (progress) => Math.sin((progress * Math.PI) / 2),
    "ease-in-out-sine": (progress) => -(Math.cos(Math.PI * progress) - 1) / 2,

    "ease-in-quad": (progress) => progress ** 2,
    "ease-out-quad": (progress) => 1 - (1 - progress) ** 2,
    "ease-in-out-quad": (progress) => progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2,

    "ease-in-cubic": (progress) => progress ** 3,
    "ease-out-cubic": (progress) => 1 - (1 - progress) ** 3,
    "ease-in-out-cubic": (progress) => progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2,

    "ease-in-quart": (progress) => progress ** 4,
    "ease-out-quart": (progress) => 1 - (1 - progress) ** 4,
    "ease-in-out-quart": (progress) => progress < 0.5 ? 8 * progress ** 4 : 1 - (-2 * progress + 2) ** 4 / 2,

    "ease-in-quint": (progress) => progress ** 5,
    "ease-out-quint": (progress) => 1 - (1 - progress) ** 5,
    "ease-in-out-quint": (progress) => progress < 0.5 ? 16 * progress ** 5 : 1 - (-2 * progress + 2) ** 5 / 2,

    "ease-in-expo": (progress) => progress === 0 ? 0 : 2 ** (10 * progress - 10),
    "ease-out-expo": (progress) => progress === 1 ? 1 : 1 - 2 ** (-10 * progress),
    "ease-in-out-expo": (progress) =>
        progress === 0 ? 0 :
        progress === 1 ? 1 :
        progress < 0.5 ? 2 ** (20 * progress - 10) / 2 :
        (2 - 2 ** (-20 * progress + 10)) / 2,

    "ease-in-circ": (progress) => 1 - Math.sqrt(1 - progress ** 2),
    "ease-out-circ": (progress) => Math.sqrt(1 - (progress - 1) ** 2),
    "ease-in-out-circ": (progress) => progress < 0.5
        ? (1 - Math.sqrt(1 - (2 * progress) ** 2)) / 2
        : (Math.sqrt(1 - (-2 * progress + 2) ** 2) + 1) / 2,

    "ease-in-back": (progress) => (BACK_OVERSHOOT + 1) * progress ** 3 - BACK_OVERSHOOT * progress ** 2,
    "ease-out-back": (progress) => 1 + (BACK_OVERSHOOT + 1) * (progress - 1) ** 3 + BACK_OVERSHOOT * (progress - 1) ** 2,
    "ease-in-out-back": (progress) => progress < 0.5
        ? ((2 * progress) ** 2 * ((BACK_IN_OUT_OVERSHOOT + 1) * 2 * progress - BACK_IN_OUT_OVERSHOOT)) / 2
        : ((2 * progress - 2) ** 2 * ((BACK_IN_OUT_OVERSHOOT + 1) * (progress * 2 - 2) + BACK_IN_OUT_OVERSHOOT) + 2) / 2,

    "ease-in-elastic": (progress) =>
        progress === 0 ? 0 :
        progress === 1 ? 1 :
        -(2 ** (10 * progress - 10)) * Math.sin((progress * 10 - 10.75) * ELASTIC_PERIOD),
    "ease-out-elastic": (progress) =>
        progress === 0 ? 0 :
        progress === 1 ? 1 :
        2 ** (-10 * progress) * Math.sin((progress * 10 - 0.75) * ELASTIC_PERIOD) + 1,
    "ease-in-out-elastic": (progress) =>
        progress === 0 ? 0 :
        progress === 1 ? 1 :
        progress < 0.5 ? -(2 ** (20 * progress - 10) * Math.sin((20 * progress - 11.125) * ELASTIC_IN_OUT_PERIOD)) / 2 :
        (2 ** (-20 * progress + 10) * Math.sin((20 * progress - 11.125) * ELASTIC_IN_OUT_PERIOD)) / 2 + 1,

    "ease-in-bounce": (progress) => 1 - easeOutBounce(1 - progress),
    "ease-out-bounce": easeOutBounce,
    "ease-in-out-bounce": (progress) => progress < 0.5
        ? (1 - easeOutBounce(1 - 2 * progress)) / 2
        : (1 + easeOutBounce(2 * progress - 1)) / 2
};

export default namedEasings;
