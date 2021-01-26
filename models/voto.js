const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");
mongoose.set('useFindAndModify', false);

let Schema = mongoose.Schema;

 let votoSchema = new Schema({
    questionId:{
        type:Schema.Types.ObjectId,
        ref:'Question'  
    },
    email:{
        type:String,
    },
    date:{
        type:Date,
    },
    conferenceId:{
        type:Schema.Types.ObjectId,
        ref:'Conference'  
    },userId:{
        type:Schema.Types.ObjectId,
        ref:'Usuario'
    }
 })

 votoSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});
 module.exports = mongoose.model('Voto',votoSchema);