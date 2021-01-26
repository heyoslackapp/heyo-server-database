const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let packTypes = {
  values: ["LINK", "IMAGE", "TEXT", "HTML", "CODE"],
  message: "{VALUE} no es un role valido",
};


let planSchema = new Schema({
  name: {
    type: String,
    require: [true, "Es necesario el name amigo!!"],
  },
  tag: {
    type: String,
  },
  duration: {
    type: String,
  },
  contact: {
    type: String,
  },
  type: {
    type: String,
    default: "TEXT",
    enum: packTypes,
  },
  maxLimit: {
    type: String,
  },
  minLimit: {
    type: String,
  },
  price: {
    type: String,
  },
  status: {
    type: String,
  },
  new: {
    type: String,
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
  storage: {
    type: String,
  },
  cupon: {
    type: String,
  },
  thumb: {
    type: String,
  },
  category: {
    type: String,
  },
  emailConfirmation: {
    type: String,
  },
  emailWelcome: {
    type: String,
  },
  emailRegistration: {
    type: String,
  },
  emailClosure: {
    type: String,
  },
  summary: {
    type: String,
  },
  itinerary: {
    type: String,
  },
  iframeMap: {
    type: String,
  },
  public: {
    type: Boolean,
  },
  active: {
    type: Boolean,
  },
  startdate: {
    type: Date,
  },
  closuredate: {
    type: Date,
  },
  archived: {
    type: Date,
  },
  featureImage: {
    type: String,
  },
  observation: {
    type: String,
  },
  position: {
    type: String,
  },
  instanceId: {
    type: Schema.Types.ObjectId,
    ref: "Instance",
  },
  rootId: {
    type: Schema.Types.ObjectId,
    ref: "Root",
  },
  packId: {
    type: Schema.Types.ObjectId,
    ref: "Pack",
  },
  avatar: {
    type: String,
  },
  body: {
    type: String,
  },
  bodyResponsive: {
    type: String,
  },
  creartedAt: {
    type: Date,
    default: moment.now(),
  },
  lastUpdatedAt: {
    type: Date,
  },
  lastUpdatedBy: {
    type: String,
  },
});

planSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

planSchema.methods.toJSON = function () {
  let agencia = this;
  let instanceObject = agencia.toObject();
  //delete conferenceObject.password;
  return instanceObject;
};

module.exports = mongoose.model("Plan", planSchema);
