const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let systemSchema = new Schema({
  name: {
    type: String,
  },
  code: {
    type: String,
  },
  active: {
    type: Boolean,
  },
  key: {
    type: String,
  },
});

systemSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

systemSchema.methods.toJSON = function () {
  let agencia = this;
  let systemObject = agencia.toObject();
  //delete systemObject.password;
  return systemObject;
};

module.exports = mongoose.model("System", systemSchema);
