const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
var moment = require("moment");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let transSchema = new Schema({
  description: {
    type: String,
    require: [true, "Es necesario el name amigo!!"],
  },
  createAt: {
    type: Date,
    default: moment.now(),
  },
  phone: {
    type: String,
  },
  type: {
    type: String,
    default: "inbound",
  },
  mode: {
    type: String,
  },
  email: {
    type: String,
  },
  serial: {
    type: Number,
  },
  code: {
    type: String,
  },
  fullname: {
    type: String,
  },
  status: {
    type: String,
  },
  amount: {
    type: String,
  },
  pending: {
    type: String,
  },
  total: {
    type: String,
  },
  reference: {
    type: String,
  },
  archived: {
    type: Date,
  },
  instanceId: {
    type: Schema.Types.ObjectId,
    ref: "Instance",
  },
  rootId: {
    type: Schema.Types.ObjectId,
    ref: "Root",
  },
  appId: {
    type: Schema.Types.ObjectId,
    ref: "App",
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: "Plan",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

transSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

transSchema.methods.toJSON = function () {
  let agencia = this;
  let instanceObject = agencia.toObject();
  //delete conferenceObject.password;
  return instanceObject;
};

module.exports = mongoose.model("Trans", transSchema);
