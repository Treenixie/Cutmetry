import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "build", "pages");

async function copyRuntime(source, target) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(target, entry.name);
    if (entry.isDirectory()) await copyRuntime(from, to);
    else if (entry.isFile() && entry.name.endsWith(".js")) await copyFile(from, to);
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const filename of ["index.html", "app.js", "styles.css", "_headers"]) {
  await copyFile(resolve(root, "web", filename), resolve(output, filename));
}
await copyRuntime(resolve(root, "dist", "core"), resolve(output, "dist", "core"));
console.log(`Prepared Cloudflare Pages assets in ${output}`);
