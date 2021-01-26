const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);
 let Schema = mongoose.Schema;

 // h hover = c click = v Pageview = f formSubmit = s scroll = d device = z resizeWindow
 let types = {
     values: ['h','c','v','f','s','z','d'],
     message:'{VALUE} no es un role valido'
 }

 
 let actionSchema = new Schema({
    
   event:{
        type:String,
        enum:types
        },  
    code:{
        type:String
    },
    contact:{
        type:String
    },
    client:{
        type:String
    }
 })

 actionSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 actionSchema.methods.toJSON = function () {
        let track = this;
        let trackObject = track.toObject();
        //delete trackObject.password;
        return trackObject;
 }

 module.exports = mongoose.model('Action',actionSchema);