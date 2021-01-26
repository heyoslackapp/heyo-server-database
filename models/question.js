const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");
mongoose.set('useFindAndModify', false);

let Schema = mongoose.Schema;

 let questionSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'Usuario'
    },
    question:{
        type:String,
    },
    status:{
        type:Boolean,
        },
    email:{
        type:String,
    },
    language:{
        type:String,
    },
    date:{
        type:Date,
    },
    conferenceId:{
        type:Schema.Types.ObjectId,
        ref:'Conference'
    },
    votos:{
        type:String
    }
 })

 questionSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});
 module.exports = mongoose.model('Question',questionSchema);