const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 
 let imageSchema = new Schema({
       contentType:{
        type:String
        },
        image:{
        type:String
        },
        conferenceId:{
              type:Schema.Types.ObjectId,
              ref:'Conferences' 
        },
        date:{
               type:Date
        }
 })

 imageSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 imageSchema.methods.toJSON = function () {
        let track = this;
        let trackObject = track.toObject();
        //delete trackObject.password;
        return trackObject;
 }

 module.exports = mongoose.model('Image',imageSchema);