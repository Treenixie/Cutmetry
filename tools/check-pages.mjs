import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "build", "pages");
for (const filename of ["index.html", "styles.css", "workshop.css", "app.js", "_headers", "assets/paper-fiber.svg", "assets/mat-fiber.svg", "dist/core/index.js"]) {
  assert.ok((await stat(resolve(output, filename))).isFile(), `Missing Pages asset: ${filename}`);
}
const html = await readFile(resolve(output, "index.html"), "utf8");
const app = await readFile(resolve(output, "app.js"), "utf8");
assert.match(html, /<script[^>]+src="\.\/app\.js"/);
assert.match(html, /<link[^>]+href="\.\/styles\.css"/);
assert.match(html, /<link[^>]+href="\.\/workshop\.css"/);
const match = app.match(/from\s+["'](\.\.\/dist\/core\/index\.js)["']/);
assert.ok(match, "Browser app must import the deployed core module");
const importPath = new URL(match[1], "https://preview.example/app.js").pathname.slice(1);
assert.equal(importPath, "dist/core/index.js");
const runtime = await import(pathToFileURL(resolve(output, importPath)).href);
assert.equal(typeof runtime.createProject, "function");
const { execFileSync } = await import("node:child_process");
execFileSync(process.execPath, ["--check", resolve(output, "app.js")], { stdio: "pipe" });
const theme = await readFile(resolve(output, "workshop.css"), "utf8");
assert.match(theme, /color-scheme:\s*light/);
assert.match(theme, /assets\/paper-fiber\.svg/);
assert.match(theme, /assets\/mat-fiber\.svg/);
for (const id of ["overlayOpacity", "toggleOverlay", "canvasNote", "materialControls"]) {
  assert.ok(html.includes(`id="${id}"`), `Missing workbench control ${id}`);
}

const rootFiles = await readdir(output);
assert.ok(!rootFiles.includes("README.md"), "Do not publish the repository root");
const coreFiles = await readdir(resolve(output, "dist", "core"));
assert.ok(coreFiles.every((name) => !name.endsWith(".d.ts")), "Do not publish TypeScript declaration files");
console.log("Cloudflare Pages static output validated");
