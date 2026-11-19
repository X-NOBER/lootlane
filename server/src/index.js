const { createServer } = require("node:http");

const host = "0.0.0.0";
const port = Number(process.env.PORT) || 4000;

const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "ok", service: "lootbox-server" }));
    return;
  }

  response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, host, () => {
  console.log(`Lootlane API scaffold listening on http://${host}:${port}`);
});
