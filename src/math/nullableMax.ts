export default function nullableMax(first: number | null, second: number | null): number | null {
    if (first == null) {
        return second;
    }
    return second == null ? first : Math.max(first, second);
}
