const express = require("express");
const app = express();

app.use(require("./login"));
app.use(require("./agency"));
app.use(require("./user"));
app.use(require("./system"));
app.use(require("./instance"));
app.use(require("./root"));
app.use(require("./interactive"));
app.use(require("./slack"));

module.exports = app;
