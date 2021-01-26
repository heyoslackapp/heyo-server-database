const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);

 let Schema = mongoose.Schema;

 let rolesValidos = {
     values: ['ADMIN','USER','ROOT,'],
     message:'{VALUE} no es un role valido'
 }

 let masterSchema = new Schema({
    fatherId:{
        type:Schema.Types.ObjectId,
        ref:'Master'
    },
    date:{
        type:Date,
    },
    archived:{
        type:Date,
    },
    created:{
        type:Date,
    },
     name:{
        type:String,
    },
    active:{
        type:Boolean,
    },
    value:{
        type:String,
    },
    rootId:{
        type:Schema.Types.ObjectId,
        ref:'Root' 
    },
    description:{
        type:String,
    },
    instanceId:{
        type:Schema.Types.ObjectId,
        ref:'Instance' 
    },
 });

 masterSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 masterSchema.methods.toJSON = function () {
        let user = this;
        let userObject = user.toObject();
        delete userObject.password;
        return userObject;
 }

 module.exports = mongoose.model('Master',masterSchema);