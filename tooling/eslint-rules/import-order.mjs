/**
 * ESLint rule enforcing the project's import convention.
 *
 * Ordering of the leading import block:
 *   1. side-effect imports (`import "x"`): kept at the top, in source order, untouched
 *   2. package imports (anything not starting with "."): one block, sorted
 *      alphabetically (case-insensitive) by the full specifier (no blank lines)
 *   3. relative imports: sorted alphabetically (case-insensitive) by the full
 *      specifier, with one
 *      blank line wherever two consecutive imports come from a different
 *      directory (the substring before the last "/"). Because the sort is
 *      lexicographic, shallower paths naturally come before their subfolders
 *      (e.g. `../api` before `../api/events`).
 */

/** Case-insensitive comparison, with the case-sensitive order as a stable tiebreak. */
function compareStrings(left, right) {
    const leftLower = left.toLowerCase();
    const rightLower = right.toLowerCase();
    if (leftLower < rightLower) return -1;
    if (leftLower > rightLower) return 1;
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
}

/** A package import is any specifier that does not start with ".". */
function isRelative(source) {
    return source.startsWith(".");
}

/** Directory portion of a specifier: everything before the last "/". */
function directoryKey(source) {
    const lastSlash = source.lastIndexOf("/");
    return lastSlash === -1 ? source : source.slice(0, lastSlash);
}

/** Index of the start of the line containing `position`. */
function lineStartIndex(text, position) {
    return text.lastIndexOf("\n", position - 1) + 1;
}

const importOrderRule = {
    meta: {
        type: "layout",
        docs: { description: "Enforce the project's import grouping and ordering." },
        fixable: "code",
        schema: [],
        messages: {
            reorder: "Gli import non rispettano l'ordinamento/raggruppamento della convenzione del progetto.",
            comments: "Il blocco import contiene commenti: riordinalo a mano (autofix disabilitato per non perderli).",
        },
    },
    create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const text = sourceCode.text;

        return {
            "Program:exit"(programNode) {
                const imports = [];
                for (const statement of programNode.body) {
                    if (statement.type !== "ImportDeclaration") break;
                    imports.push(statement);
                }
                if (imports.length < 2) return;

                const regionStart = lineStartIndex(text, imports[0].range[0]);
                const regionEnd = imports[imports.length - 1].range[1];

                // Bail (report without fix) if comments live between imports, so we never drop them.
                const hasInnerComment = sourceCode
                    .getAllComments()
                    .some((comment) => comment.range[0] >= imports[0].range[0] && comment.range[0] < regionEnd);
                if (hasInnerComment) {
                    context.report({ node: imports[0], messageId: "comments" });
                    return;
                }

                /** Full text of an import including its own leading indentation. */
                const importText = (node) => text.slice(lineStartIndex(text, node.range[0]), node.range[1]);

                // Leading side-effect imports are frozen verbatim at the top.
                let prefixCount = 0;
                while (prefixCount < imports.length && imports[prefixCount].specifiers.length === 0) {
                    prefixCount += 1;
                }
                const prefixImports = imports.slice(0, prefixCount);
                const restImports = imports.slice(prefixCount);

                const blocks = [];

                if (prefixImports.length > 0) {
                    const prefixStart = lineStartIndex(text, prefixImports[0].range[0]);
                    blocks.push(text.slice(prefixStart, prefixImports[prefixImports.length - 1].range[1]));
                }

                if (restImports.length > 0) {
                    const packages = [];
                    const relatives = [];
                    for (const node of restImports) {
                        if (isRelative(node.source.value)) relatives.push(node);
                        else packages.push(node);
                    }

                    if (packages.length > 0) {
                        packages.sort((first, second) => compareStrings(first.source.value, second.source.value));
                        blocks.push(packages.map(importText).join("\n"));
                    }

                    if (relatives.length > 0) {
                        relatives.sort((first, second) => compareStrings(first.source.value, second.source.value));
                        let relativeText = "";
                        for (let index = 0; index < relatives.length; index += 1) {
                            if (index > 0) {
                                const changedDirectory =
                                    directoryKey(relatives[index].source.value) !==
                                    directoryKey(relatives[index - 1].source.value);
                                relativeText += changedDirectory ? "\n\n" : "\n";
                            }
                            relativeText += importText(relatives[index]);
                        }
                        blocks.push(relativeText);
                    }
                }

                const desired = blocks.join("\n\n");
                if (desired === text.slice(regionStart, regionEnd)) return;

                context.report({
                    node: imports[0],
                    messageId: "reorder",
                    fix: (fixer) => fixer.replaceTextRange([regionStart, regionEnd], desired),
                });
            },
        };
    },
};

export default importOrderRule;
