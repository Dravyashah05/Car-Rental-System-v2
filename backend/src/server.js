require("dotenv").config(); // ✅ MUST be at the top

const dns = require("dns");
const http = require("http");
const app = require("./app");
const connectDb = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const configureDnsForSrv = () => {
  const rawServers = process.env.DNS_SERVERS;
  if (rawServers) {
    const servers = rawServers
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    if (servers.length > 0) {
      dns.setServers(servers);
      console.log(`DNS_SERVERS applied: ${servers.join(", ")}`);
      return;
    }
  }

  const currentServers = dns.getServers();
  const loopbackOnly =
    currentServers.length > 0 &&
    currentServers.every((server) => server === "127.0.0.1" || server === "::1");

  if (loopbackOnly) {
    console.warn(
      `Warning: Node DNS servers are set to loopback (${currentServers.join(
        ", "
      )}). SRV lookups (mongodb+srv://...) may fail. Set DNS_SERVERS to a working resolver (e.g. your adapter DNS from ipconfig /all, or 1.1.1.1,8.8.8.8) or fix your system DNS.`
    );
  }
};

configureDnsForSrv();

connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    if (err?.syscall === "querySrv" && err?.code === "ECONNREFUSED") {
      const servers = dns.getServers();
      console.error(
        `MongoDB SRV DNS lookup failed (ECONNREFUSED). Current Node DNS servers: ${
          servers.length > 0 ? servers.join(", ") : "(none)"
        }`
      );
      console.error(
        "Fix: run a DNS resolver on 127.0.0.1, or set DNS_SERVERS to a working resolver (e.g. your adapter DNS from ipconfig /all, or 1.1.1.1,8.8.8.8), or switch MONGO_URI to a non-SRV mongodb:// connection string."
      );
    }
    process.exit(1);
  });
