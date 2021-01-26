const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let rolesValidos = {
  values: ["ADMIN", "USER", "ROOT", "GUEST"],
  message: "{VALUE} no es un role valido",
};

let guestSchema = new Schema({
  firstname: {
    type: String,
    require: [true, "the firstname is required"],
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "the email is required"],
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  avatar: {
    type: String,
    required: [false],
  },
  role: {
    type: String,
    default: "USER",
    enum: rolesValidos,
  },
  date: {
    type: Date,
  },
  description: {
    type: String,
    required: [false],
  },
  country: {
    type: String,
  },
  region: {
    type: String,
  },
  city: {
    type: String,
  },
  latitud: {
    type: String,
  },
  flag: {
    type: String,
  },
  longitud: {
    type: String,
  },
  activation: {
    type: Date,
  },
  invitation: {
    type: Boolean,
  },
  invitation: {
    type: Boolean,
  },
  status: {
    type: Boolean,
  },
  lastUpdated: {
    type: Date,
  },
  archived: {
    type: Date,
  },
  birthdate: {
    type: Date,
  },
  document: {
    type: String,
  },
  documentType: {
    type: String,
  },
  category: {
    type: String,
  },
  reference: {
    type: String,
  },
  observation: {
    type: String,
  },
  type: {
    type: String,
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
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  instanceId: {
    type: Schema.Types.ObjectId,
    ref: "Instance",
  },
  rootId: {
    type: Schema.Types.ObjectId,
    ref: "Root",
  },
});

guestSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

guestSchema.methods.toJSON = function () {
  let guest = this;
  let guestObject = guest.toObject();
  delete guestObject.password;
  return guestObject;
};

module.exports = mongoose.model("Guest", guestSchema);
