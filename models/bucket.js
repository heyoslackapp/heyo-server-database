const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);

let Schema = mongoose.Schema;

let bucketSchema = new Schema({
  contentType: {
    type: String,
  },
  image: {
    type: String,
  },
  entity: {
    type: String,
  },
  instanceId: {
    type: Schema.Types.ObjectId,
    ref: "Instance",
  },
  packId: {
    type: Schema.Types.ObjectId,
    ref: "Pack",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: "Plan",
  },
  rootId: {
    type: Schema.Types.ObjectId,
    ref: "Root",
  },
  appId: {
    type: Schema.Types.ObjectId,
    ref: "App",
  },
  createdAt: {
    type: Date,
  },
  archived: {
    type: Date,
  },
  createdBy: {
    type: String,
  },
  type: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  public: {
    type: Boolean,
  },
  active: {
    type: Boolean,
  },
});

bucketSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

bucketSchema.methods.toJSON = function () {
  let track = this;
  let trackObject = track.toObject();
  //delete trackObject.password;
  return trackObject;
};

module.exports = mongoose.model("Bucket", bucketSchema);
