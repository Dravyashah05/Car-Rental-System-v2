require("dotenv").config(); // ✅ MUST be at the top

const http = require("http");
const app = require("./app");
const connectDb = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
