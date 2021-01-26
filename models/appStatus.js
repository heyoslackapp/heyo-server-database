const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let rolesValidos = {
  values: ["ADMIN", "USER", "ROOT,"],
  message: "{VALUE} no es un role valido",
};

let appStatusSchema = new Schema({
  status: {
    type: String,
  },
  observation: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  rootId: {
    type: Schema.Types.ObjectId,
    ref: "Root",
  },
  instanceId: {
    type: Schema.Types.ObjectId,
    ref: "Instance",
  },
});

appStatusSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

appStatusSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("AppStatus", appStatusSchema);
