require("dotenv").config(); // ✅ MUST be at the top

const dns = require("dns");
const net = require("net");
const http = require("http");
const app = require("./app");
const connectDb = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const isValidPort = (port) => {
  const portNumber = Number(port);
  return Number.isInteger(portNumber) && portNumber > 0 && portNumber <= 65535;
};

const normalizeDnsServer = (server) => {
  const trimmed = String(server ?? "").trim();
  if (!trimmed) return "";
  return trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
};

const isValidDnsServer = (server) => {
  if (net.isIP(server)) return true;

  // IPv6 with port must be bracketed: [::1]:53
  const ipv6WithPort = server.match(/^\[([^\]]+)\]:(\d+)$/);
  if (ipv6WithPort) {
    const [, address, port] = ipv6WithPort;
    return net.isIP(address) === 6 && isValidPort(port);
  }

  // IPv4 with port: 8.8.8.8:53
  const ipv4WithPort = server.match(/^(.+):(\d+)$/);
  if (ipv4WithPort) {
    const [, address, port] = ipv4WithPort;
    return net.isIP(address) === 4 && isValidPort(port);
  }

  return false;
};

const configureDnsForSrv = () => {
  const rawServers = process.env.DNS_SERVERS;
  if (rawServers) {
    const servers = rawServers
      .split(",")
      .map(normalizeDnsServer)
      .filter(Boolean);

    if (servers.length > 0) {
      const validServers = servers.filter(isValidDnsServer);
      const invalidServers = servers.filter((server) => !isValidDnsServer(server));

      if (invalidServers.length > 0) {
        console.warn(
          `Warning: ignoring invalid DNS_SERVERS entries: ${invalidServers.join(
            ", "
          )}`
        );
      }

      if (validServers.length > 0) {
        try {
          dns.setServers(validServers);
          console.log(`DNS_SERVERS applied: ${validServers.join(", ")}`);
          return;
        } catch (err) {
          console.warn(
            `Warning: failed to apply DNS_SERVERS (${validServers.join(
              ", "
            )}). Using system DNS instead.`
          );
          console.warn(err);
        }
      } else {
        console.warn(
          "Warning: DNS_SERVERS is set but no valid entries were found. Using system DNS instead."
        );
      }
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
