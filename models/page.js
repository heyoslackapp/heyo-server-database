const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 
 let pageSchema = new Schema({
    
    referrer:{
        type:String
        },  
    user:{
        type:String
    },
    device:{
        type:String
    },
    width:{
        type:String
    },
    url:{
        type:String
    },
    downlink:{
        type:String
    },
    platform:{
        type:String
    },
    language:{
        type:String
    },
    userAgent:{
        type:String
    },
    speed:{
        type:String
    },country:{
        type:String
    },region:{
        type:String
    },city:{
        type:String
    },ll:{
        type:String
    },ip:{
        type:String
    },date:{
        type:Date
    },client:{
        type:String
    },
    responsive:{
        type:String
    }
 })

 

 pageSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 pageSchema.methods.toJSON = function () {
        let track = this;
        let trackObject = track.toObject();
        //delete trackObject.password;
        return trackObject;
 }

 module.exports = mongoose.model('Page',pageSchema);