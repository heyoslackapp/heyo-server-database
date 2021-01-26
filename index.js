require("./config/config");
const express = require("express");
const mongoose = require("mongoose");
//const Server = require("./models/server");
const http = require("http");

const socketio = require("socket.io");
const Sockets = require("./models/socket");

//const serverSocket = new Server();
//serverSocket.execute();


const app = express();
const server = http.createServer(app);
const io = socketio(server);
new Sockets(io);
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, "public")));

app.use(require("./routes/index"));

app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");

hbs.registerHelper("owner", () => {
  return "Pedro Alejandro Rojas Garcia";
});

mongoose
  .connect(process.env.urlDB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB Connected!"))
  .catch((err) => {
    console.log("error pedrito");
    console.log(err);
  });

  server.listen(process.env.PORT, () => {
  console.log(process.env.PORT);
});
