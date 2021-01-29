const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let instanceSchema = new Schema({
  name: {
    type: String,
    require: [true, "Es necesario el name amigo!!"],
  },
  code: {
    type: String,
  },
  key: {
    type: String,
    require: [true, "Es necesario el name amigo!!"],
  },
  alias: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  active: {
    type: Boolean,
  },
  description: {
    type: String,
  },
  facebook: {
    type: String,
  },
  instagram: {
    type: String,
  },
  youtube: {
    type: String,
  },
  website: {
    type: String,
  },
  primary: {
    type: String,
  },
  secondary: {
    type: String,
  },
  background: {
    type: String,
  },
  logo: {
    type: String,
  },
  cover: {
    type: String,
  },
  systemId: {
    type: Schema.Types.ObjectId,
    ref: "System",
  },
});

instanceSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

instanceSchema.methods.toJSON = function () {
  let agencia = this;
  let instanceObject = agencia.toObject();
  return instanceObject;
};

module.exports = mongoose.model("Instance", instanceSchema);
