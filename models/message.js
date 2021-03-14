const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let messageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Slackuser",
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
  created: {
    type: Date,
  },
  conversation: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
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
