require("./config/config");
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");

const app = express();
const server = http.createServer(app);
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
//const { addRows } = require("./database/database");
/*
(async () => {
  // See: https://api.slack.com/methods/chat.postMessage
  const res = await web.chat.postMessage({ channel: conversationId, text: 'Hello there' });

  const result = await web.conversations.create({
    // The name of the conversation
    name: "emoji-enthusiasts"
  });

  console.log('Conversation sent: ', result.ts);

  // `res` contains information about the posted message
  console.log('Message sent: ', res.ts);
})();
*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, "public")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(require("./routes/index"));

app.set("view engine", "hbs");
// app.use(compression());
// app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, "public")));
hbs.registerPartials(__dirname + "/views/partials");

hbs.registerHelper("owner", () => {
  return "";
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

//addRows();

server.listen(process.env.PORT, () => {
  console.log(process.env.PORT);
  console.log("conectado");
});
