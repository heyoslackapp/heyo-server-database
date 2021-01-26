const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
var moment = require("moment");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let appSchema = new Schema({
  price: {
    type: String,
  },
  status: {
    type: String,
  },
  statusObservation: {
    type: String,
  },
  statusCreatedAt: {
    type: Date,
  },
  departurePlace: {
    type: String,
  },
  url: {
    type: String,
  },
  phone: {
    type: String,
  },
  paymentLink: {
    type: String,
  },
  cupon: {
    type: String,
  },
  amount: {
    type: Number,
  },
  public: {
    type: Boolean,
  },
  active: {
    type: Boolean,
  },
  startDate: {
    type: Date,
  },
  closureDate: {
    type: Date,
  },
  creartedAt: {
    type: Date,
    default: moment.now(),
  },
  lastUpdatedAt: {
    type: Date,
  },
  archived: {
    type: Date,
  },
  observation: {
    type: String,
  },
  code: {
    type: String,
  },
  serial: {
    type: Number,
  },
  instanceId: {
    type: Schema.Types.ObjectId,
    ref: "Instance",
  },
  rootId: {
    type: Schema.Types.ObjectId,
    ref: "Root",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: "Plan",
  },
  packId: {
    type: Schema.Types.ObjectId,
    ref: "Pack",
  },
});

appSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

appSchema.methods.toJSON = function () {
  let agencia = this;
  let instanceObject = agencia.toObject();
  //delete conferenceObject.password;
  return instanceObject;
};

module.exports = mongoose.model("App", appSchema);
