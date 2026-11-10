export default function nullableMin(first: number | null, second: number | null): number | null {
    if (first == null) {
        return second;
    }
    return second == null ? first : Math.min(first, second);
}
