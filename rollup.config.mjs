import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

import typescript from "@rollup/plugin-typescript";

const TEST_SERVER_PORT = 8080;

const CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml"
};

// serves the test page once the first bundle is written; it lives in the rollup process, so it
// stops together with the watcher
function serveTestPage(rootDirectory, port) {
    let server = null;

    return {
        name: "serve-test-page",
        writeBundle() {
            if (server != null) {
                return;
            }

            server = createServer(async (request, response) => {
                const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
                const relativePath = normalize(pathname.endsWith("/") ? pathname + "index.html" : pathname);
                if (relativePath.split(/[\\/]/).includes("..")) {
                    response.writeHead(403).end();
                    return;
                }

                try {
                    const content = await readFile(join(rootDirectory, relativePath));
                    response.writeHead(200, {
                        "Content-Type": CONTENT_TYPES[extname(relativePath)] ?? "application/octet-stream",
                        "Cache-Control": "no-store"
                    });
                    response.end(content);
                } catch {
                    response.writeHead(404).end();
                }
            });
            server.listen(port, () => {
                console.log(`test page served at http://localhost:${port}`);
            });
        }
    };
}

// CommonJS and UMD export the object itself, not a default property: the declarations say the same
function exportAssignment() {
    return {
        name: "export-assignment",
        generateBundle(outputOptions, bundle) {
            const declaration = bundle["index.d.ts"];
            if (declaration != null && declaration.type === "asset") {
                declaration.source = String(declaration.source).replace(/^export default (\w+);$/m, "export = $1;");
            }
        }
    };
}

const library = {
    input: "src/index.ts",
    plugins: [
        typescript({
            include: ["src/**/*.ts"],
            declaration: true,
            declarationDir: "dist"
        }),
        exportAssignment()
    ],
    output: [
        {
            name: "dataScrollAnimation",
            file: "dist/index.js",
            format: "umd",
            esModule: true
        },
        {
            file: "dist/index.es.js",
            format: "es"
        }
    ]
};

const testPage = {
    input: "test/src/main.ts",
    plugins: [
        typescript(),
        process.env.ROLLUP_WATCH === "true" && serveTestPage("test", TEST_SERVER_PORT)
    ],
    output: {
        file: "test/scripts/main.js",
        format: "umd"
    }
};

export default process.env.BUILD === "test" ? testPage : library;
