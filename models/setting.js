const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");
mongoose.set('useFindAndModify', false);

let Schema = mongoose.Schema;

 let settingSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'Usuario'
    },
    name:{
        type:String,
    },
    status:{
        type:Boolean,
        },
    value:{
        type:String,
    },
    description:{
        type:String,
    },
    date:{
        type:Date,
    },
    conferenceId:{
        type:Schema.Types.ObjectId,
        ref:'Conference'
    }
 })

 settingSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});
 module.exports = mongoose.model('Setting',settingSchema);