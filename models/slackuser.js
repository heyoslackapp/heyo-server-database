const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
var randomColor = require('randomcolor'); // import the script

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let slackuserSchema = new Schema({
  user_name: {
    type: String,
  },
  user_id: {
    type: String,
  },
  team_id: {
    type: String,
  },
  team_domain: {
    type: String,
  },
  channel_id: {
    type: String,
  },
  channel_name: {
    type: String,
  },
  text: {
    type: String,
  },
  response_url: {
    type: String,
  }
});

slackuserSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

slackuserSchema.methods.toJSON = function () {
  let agencia = this;
  let instanceObject = agencia.toObject();
  return instanceObject;
};

module.exports = mongoose.model("Slackuser", slackuserSchema);
