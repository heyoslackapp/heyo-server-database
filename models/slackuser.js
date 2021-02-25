const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
var randomColor = require("randomcolor"); // import the script

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let slackuserSchema = new Schema({
  user: {
    type: String,
  },
  channel: {
    type: String,
  },
  state: {
    type: String,
  },
  team: {
    type: String,
  },
  mode: {
    type: String,
  },
  people: {
    type: Number,
  },
  username: {
    type: String,
  },
  avatar: {
    type: String,
  },
  title: {
    type: String,
  },
  connections: {
    type: Number,
  },
  datelimit: {
    type: Date,
  },
});

slackuserSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

slackuserSchema.methods.toJSON = function () {
  let agencia = this;
  let instanceObject = agencia.toObject();
  return instanceObject;
};

module.exports = mongoose.model("Slackuser", slackuserSchema);
