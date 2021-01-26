const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 let types = {
     values: ['CLICK','SCROLL','SUBMIT','PAGE','VIDEO','MENU','SECTION'],
     message:'{VALUE} no es un role valido'
 }

 let formSchema = new Schema({
    
   type:{
        type:String,
        default:'TEXT',
        enum:types
        },
    fields:{
        type:String
         },
    user:{
        type:String
      },   
      emails:{
        type:String
      },  
    code:{
       type:String
         },
    campaign:{
        type:String
        },       
    created:{
        type:String
        },     
    estado:{
        type:Boolean
        },
    key:{
        type:String
    },
    webhook:{
        type:String
    },
    server:{
        type:String
    },
    userId:{
        type:Number,
        required:[false]
    }
 })

 formSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 formSchema.methods.toJSON = function () {
        let form = this;
        let formObject = form.toObject();
        //delete eventObject.password;
        return formObject;
 }

 module.exports = mongoose.model('form',formSchema);