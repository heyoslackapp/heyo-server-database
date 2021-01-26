const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);

 let Schema = mongoose.Schema;

 let conferenceSchema = new Schema({    
    name:{
        type:String,
        require:[true, 'Es necesario el name amigo!!']
    },codigo:{
        type:String,
    },
    date:{
        type:Date,
    },
    scheduleDate:{
        type:Date,
    },
    scheduleTime:{
        type:String,
    },
    address:{
        type:String,
        },
    email:{
        type:String,
    },
    phone:{
        type:String,
    },
    active:{
        type:Boolean,
    },
    map:{
        type:String,
    },
    description:{
        type:String,
    },
    gallery:{
        type:String,
    },avatar:{
        type:String,
    },
    facebook:{
        type:String,
    },
    instagram:{
        type:String,
    },
    youtube:{
        type:String,
    },
    items:{
        type:String,
        required:[false]
    },website:{
        type:String,
    },formID:{
        type:String,
    },metadescription:{
        type:String,
    },primary:{
        type:String,
    },secondary:{
        type:String,
    },background:{
        type:String,
    },logo:{
        type:String,
    },cover:{
        type:String,
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'Usuario' 
    },
    title:{
        type:String,
    },
    subtitle:{
        type:String,
    },speakers:{
        type:String
    },sync:{
        type:Number
    },urlVideoEn:{
        type:String
    },urlVideoEs:{
        type:String
    }

 })

 conferenceSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 conferenceSchema.methods.toJSON = function () {
        let agencia = this;
        let conferenceObject = agencia.toObject();
        //delete conferenceObject.password;
        return conferenceObject;
 }

 module.exports = mongoose.model('Conference',conferenceSchema);