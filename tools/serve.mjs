import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};
const port = Number(process.env.PORT || 4173);

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    const file = resolve(root, "." + (pathname === "/" ? "/web/index.html" : pathname));
    if (!file.startsWith(root + sep)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) throw Error("Not a file");
    const type = types[extname(file)];
    if (!type) { response.writeHead(404).end("Not found"); return; }
    response.writeHead(200, { "content-type": type, "cache-control": "no-store", "x-content-type-options": "nosniff" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`Cutmetry preview at http://127.0.0.1:${port}\n`);
});
