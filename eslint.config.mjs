import tsParser from "@typescript-eslint/parser";

import importOrder from "./tooling/eslint-rules/import-order.mjs";

export default [
    {
        ignores: ["dist", "test/scripts"],
    },
    {
        files: ["src/**/*.ts", "test/src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
        },
        plugins: {
            local: { rules: { "import-order": importOrder } },
        },
        rules: {
            "local/import-order": "error",
        },
    },
];
