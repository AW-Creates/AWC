const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Allow": "GET, HEAD", "Content-Length": "0" });
    return res.end();
  }
  if (req.url === "/favicon.ico") {
    res.writeHead(204);
    return res.end();
  }
  if (req.url !== "/" && req.url !== "/index.html") {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return req.method === "HEAD" ? res.end() : res.end("Not found\n");
  }
  fs.stat(indexPath, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      return req.method === "HEAD" ? res.end() : res.end("Index unavailable\n");
    }
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": stat.size,
      "Cache-Control": "no-store"
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(indexPath).on("error", () => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    }).pipe(res);
  });
});

server.on("error", (error) => {
  console.error(`AWC preview server error: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log(`AWC canonical preview: http://${host}:${port}/`));

