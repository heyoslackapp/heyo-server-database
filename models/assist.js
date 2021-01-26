const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);

 let Schema = mongoose.Schema;

 let rolesValidos = {
     values: ['ADMIN','USER','ROOT,'],
     message:'{VALUE} no es un role valido'
 }

 let assistSchema = new Schema({
    type:{
        type:String,
    },
    location:{
        type:String
    },
    created:{
        type:Date,
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User' 
    },
    rootId:{
        type:Schema.Types.ObjectId,
        ref:'Root' 
    },
    observation:{
        type:String,
    },
    active:{
        type:Boolean,
    },
    instanceId:{
        type:Schema.Types.ObjectId,
        ref:'Instance' 
    },
    archived:{
        type:Date,
    },
 })

 assistSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 assistSchema.methods.toJSON = function () {
        let user = this;
        let userObject = user.toObject();
        delete userObject.password;
        return userObject;
 }

 module.exports = mongoose.model('Assist',assistSchema);