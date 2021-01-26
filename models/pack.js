const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
var randomColor = require('randomcolor'); // import the script

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let packTypes = {
  values: ["LINK", "IMAGE", "TEXT", "HTML", "CODE"],
  message: "{VALUE} no es un role valido",
};


let packSchema = new Schema({
  name: {
    type: String,
    require: [true, "Es necesario el name amigo!!"],
  },
  tag: {
    type: String,
  },
  type: {
    type: String,
    default: "TEXT",
    enum: packTypes,
  },
  duration: {
    type: String,
  },
  contact: {
    type: String,
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
  position: {
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
  featureImage: {
    type: String,
  },
  observation: {
    type: String,
  },
  avatar: {
    type: String,
  },
  body: {
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
  lastUpdatedBy: {
    type: String,
  },
  color:{
    type: String,
    default: randomColor()
  }
});

packSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

packSchema.methods.toJSON = function () {
  let agencia = this;
  let instanceObject = agencia.toObject();
  //delete conferenceObject.password;
  return instanceObject;
};

module.exports = mongoose.model("Pack", packSchema);
