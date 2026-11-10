import easing from "../easing";
import frames from "../frames";
import parents from "../parents";

import attachScrollObject from "./attachScrollObject";
import getRefreshedParent from "./getRefreshedParent";
import toPropertyName from "./toPropertyName";

export default function parse(element: HTMLElement, parent: parents.ScrollParent, subtree: boolean = true): void {
    let scrollOptions: { [key: string]: frames.Keyframe[] } | null = null;
    const optionsByKey: { [key: string]: frames.InterpolationOptions } = {};
    for (const attribute of element.attributes) {
        if (!attribute.name.startsWith("data-scroll-") && !attribute.name.startsWith("data-scroll.")) {
            continue;
        }
        const data: string = attribute.name.slice(11);
        if (data === "-parent") {
            parent = getRefreshedParent(element);
        } else if (data === "-trigger") {
            let trigger: number = parseFloat(attribute.value);
            if (!isNaN(trigger)) {
                parent = getRefreshedParent(element);
                parent.trigger = trigger;
            }
        } else if (data === "-bottom") {
            let bottom: number = parseFloat(attribute.value);
            if (!isNaN(bottom)) {
                parent = getRefreshedParent(element);
                parent.bottomOffset = bottom;
            }
        } else if (data === "-top") {
            let top: number = parseFloat(attribute.value);
            if (!isNaN(top)) {
                parent = getRefreshedParent(element);
                parent.topOffset = top;
            }
        } else {
            const dataSplit: string[] = data.split("-");
            dataSplit.shift();
            if (dataSplit.length > 2 || dataSplit.length === 0) {
                continue;
            }
            if (scrollOptions == null) {
                scrollOptions = {};
            }
            const propertyName: string = toPropertyName(dataSplit[0]);
            if (dataSplit.length === 1 && dataSplit[0].match(/(.*)\(\)$/)) {
                scrollOptions[propertyName] = [];
            } else {
                const frameName: string = dataSplit[1];
                const frame: number = parseFloat(frameName);
                let position: frames.FramePosition;
                if (!isNaN(frame)) {
                    position = frame;
                } else if (frameName === "before" || frameName === "after") {
                    position = frameName;
                } else if (frameName === "extrapolate") {
                    // the attribute value is ignored
                    (optionsByKey[propertyName] = optionsByKey[propertyName] || {}).extrapolate = true;
                    continue;
                } else if (frameName === "easing") {
                    // an invalid easing is ignored, so the segments stay linear
                    const easingFunction: easing.Easing | null = easing.parseEasing(attribute.value);
                    if (easingFunction != null) {
                        (optionsByKey[propertyName] = optionsByKey[propertyName] || {}).easing = easingFunction;
                    }
                    continue;
                } else {
                    continue;
                }
                (scrollOptions[propertyName] = scrollOptions[propertyName] || []).push([ position, attribute.value ]);
            }
        }
    }
    if (scrollOptions != null) {
        attachScrollObject(element, parent, scrollOptions, optionsByKey);
    }
    if (subtree) {
        for (const child of element.children) {
            parse(child as HTMLElement, parent);
        }
    }
}
