export default function haveSameShape(staticParts: string[], otherStaticParts: string[]): boolean {
    return staticParts.length === otherStaticParts.length &&
        staticParts.every((staticPart, index) => staticPart === otherStaticParts[index]);
}
