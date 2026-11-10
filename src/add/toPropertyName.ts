// converts "_[a-z]" to "[A-Z]" and "__" to "_"
export default function toPropertyName(attributePart: string): string {
    return attributePart.replace(/_(_|[a-z])/g, function (match: string, nextCharacter: string): string {
        return nextCharacter === "_" ? "_" : nextCharacter.toUpperCase();
    });
}
