
class Sockets {
  constructor(io) {
    this.io = io;
    global.socket = this.io;
    this.socketEvents();
  }

  emitirEvento(data) {
    this.io.on("connection", (socket) => {
      socket.emit("current-bands","data");
    });
  }

  socketEvents() {
    this.io.on("connection", (socket) => {
      console.log("cliente Conectado");

      socket.on("credenciales", (data) => {
        console.log(data);
      });

    });
  }
}

module.exports = Sockets;
