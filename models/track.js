const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 let types = {
     values: ['click','croll','submit','page','video','menu','section','cta'],
     message:'{VALUE} no es un role valido'
 }

 
 let trackSchema = new Schema({
    
   type:{
        type:String,
        default:'page',
        enum:types
        },
    agent:{
            type:String   
    },
    ip:{
        type:String
         },
    cta:{
        type:String
    },    
    code:{
        type:String
    }, 
    url:{
        type:String
    },     
    user:{
        type:String
      },   
    code:{
       type:String
         },
    campaign:{
        type:String
        },       
    date:{
        type:Date
        },     
    device:{
        type:String
    },
    referer:{
        type:String
    },
    country:{
        type:String
    },
    languages:{
        type:String
    },
    region:{
        type:String
    },
    server:{
        type:String
    },
    client:{
        type:String
    },
    newUser:{
        type:String,
        required:[false]
    }
 })

 trackSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 trackSchema.methods.toJSON = function () {
        let track = this;
        let trackObject = track.toObject();
        //delete trackObject.password;
        return trackObject;
 }

 module.exports = mongoose.model('Track',trackSchema);