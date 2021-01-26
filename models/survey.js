const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");
mongoose.set('useFindAndModify', false);

let Schema = mongoose.Schema;

 let surveySchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'Usuario' 
    },
    question:{
        type:String,
    },
    type:{
        type:String,
    },
    options:{
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
    }
 })

 surveySchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 module.exports = mongoose.model('Survey',surveySchema);