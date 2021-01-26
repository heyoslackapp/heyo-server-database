const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const Sockets = require("./socket");

class Server {
  constructor() {
    this.app = express();
    this.port = 8000;
    this.server = http.createServer(this.app);
    this.io = socketio(this.server);
    this.socket = "";
  }

  middlewares() {
    this.app.use(express.static(path.resolve(__dirname, "../public")));
  }

  configurarSocket() {
     new Sockets(this.io);
  }

  execute() {
    this.middlewares();
    this.configurarSocket();
    this.server.listen(8000, () => {
      console.log("Socket Server", this.port);
    });
  }

}

module.exports = Server 
