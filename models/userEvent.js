const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 
 let userEventSchema = new Schema({
    type:{
        type:String
    },
    date:{
        type:Date
    },
    description:{
        type:String
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Usuario'
    },conferenceId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Conference' 
    },questionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Question' 
    },surveyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Survey' 
    }
 })

 userEventSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 userEventSchema.methods.toJSON = function () {
        let track = this;
        let trackObject = track.toObject();
        //delete trackObject.password;
        return trackObject;
 }

 module.exports = mongoose.model('UserEvent',userEventSchema);