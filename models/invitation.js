const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let invitationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
  },
  code: {
    type: String,
  },
  status: {
    type: Boolean,
  },
  email: {
    type: String,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
  },
  activation: {
    type: Date,
  },
  preview: {
    type: Date,
  },
  conferenceId: {
    type: Schema.Types.ObjectId,
    ref: "Conference",
  },
});

invitationSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });
module.exports = mongoose.model("Invitation", invitationSchema);
