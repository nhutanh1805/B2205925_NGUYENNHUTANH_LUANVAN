require('dotenv').config();

const http = require("http");
const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");
const { initSocket } = require("./app/utils/socket.util");

async function startServer() {
  try {
    await MongoDB.connect(config.db.uri);
    console.log("Connected to the database!");

    require("./app/jobs/expireOrders.job");
    require("./app/jobs/expirePoints.job");

    const PORT = config.app.port;
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Cannot connect to the database!", error);
    process.exit();
  }
}

startServer();