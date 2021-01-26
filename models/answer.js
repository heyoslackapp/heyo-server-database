const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");
mongoose.set('useFindAndModify', false);

let Schema = mongoose.Schema;

let answerSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'Usuario'
    },
    answer:{
        type:String,
    },
    surveyId:{
        type:Schema.Types.ObjectId,
        ref:'Survey'
    },
    status:{
        type:Boolean,
        },
    date:{
        type:Date,
    },
    conferenceId:{
        type:Schema.Types.ObjectId,
        ref:'Conference'
    }
})

answerSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});
module.exports = mongoose.model('Answer',answerSchema);