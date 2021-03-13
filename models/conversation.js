const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let conversationSchema = new Schema({
  usera: {
    type: Schema.Types.ObjectId,
    ref: "Slackuser",
  },
  userb: {
    type: Schema.Types.ObjectId,
    ref: "Slackuser",
  },
  avatara: {
    type: String,
  },
  avatarb: {
    type: String,
  },
  state: {
    type: Number,
  },
  mode: {
    type: String,
  },
  created: {
    type: Date,
  },
  archived: {
    type: Date,
  },
  updated: {
    type: Date,
  },
  team: {
    type: String,
  },
});

conversationSchema.plugin(uniqueValidator, {
  message: "{PATH} debe ser unico",
});

conversationSchema.methods.toJSON = function () {
  let agencia = this;
  let instanceObject = agencia.toObject();
  return instanceObject;
};

module.exports = mongoose.model("Conversation", conversationSchema);
