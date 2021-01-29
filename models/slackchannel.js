const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
var randomColor = require('randomcolor'); // import the script

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let slackchannelSchema = new Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  is_channel: {
    type: Boolean,
  },
  is_private: {
    type: Boolean,
  },
  creator: {
    type: String,
  },
});

slackchannelSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

slackchannelSchema.methods.toJSON = function () {
  let agencia = this;
  let instanceObject = agencia.toObject();
  //delete conferenceObject.password;
  return instanceObject;
};

module.exports = mongoose.model("Slackchannel", slackchannelSchema);
