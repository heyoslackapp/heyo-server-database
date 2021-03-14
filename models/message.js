const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let messageSchema = new Schema({
  user: {
    type: String,
  },
  text: {
    type: String,
  },
  created: {
    type: Date,
  },
  team: {
    type: String,
  },
  channel: {
    type: String,
  },
  conversation: {
    type: String,
  },
});

messageSchema.plugin(uniqueValidator, {
  message: "{PATH} debe ser unico",
});

messageSchema.methods.toJSON = function () {
  let agencia = this;
  let instanceObject = agencia.toObject();
  return instanceObject;
};

module.exports = mongoose.model("Message", messageSchema);
