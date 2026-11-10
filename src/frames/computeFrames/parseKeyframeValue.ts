// numbers like "5", "-0.5", ".5", "+5" and "1e-3"; hexadecimal colors are matched too only to be
// skipped, so that their digits stay in the fixed parts instead of being interpolated
const NUMBER_PATTERN: RegExp = /#[\da-f]+|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi;

// splits a keyframe value into its numbers and the fixed parts around them:
// staticParts always has one element more than values
export default function parseKeyframeValue(value: string): { staticParts: string[], values: number[] } {
    const normalizedValue: string = value.replace(/\s+/g, " ").trim()
        .replace(/ ?, ?|\( | \)/g, match => match.trim());
    const staticParts: string[] = [];
    const values: number[] = [];
    let previousMatchEnd: number = 0;
    for (const match of normalizedValue.matchAll(NUMBER_PATTERN)) {
        if (match[0][0] === "#") {
            continue;
        }
        staticParts.push(normalizedValue.slice(previousMatchEnd, match.index));
        values.push(parseFloat(match[0]));
        previousMatchEnd = match.index! + match[0].length;
    }
    staticParts.push(normalizedValue.slice(previousMatchEnd));
    return { staticParts, values };
}
