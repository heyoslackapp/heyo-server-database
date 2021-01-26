const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 let types = {
     values: ['TEXT','CTA','IMAGE','BLOG','VIDEO','BANNER'],
     message:'{VALUE} no es un role valido'
 }

 let contentSchema = new Schema({
    
    title:{
        type:String,
        require:[true, 'Es necesario el nombre amigo!!']
    },
    subtitle:{
        type:String
    },
    ctas:{
        type:String
    },
    images:{
        type:String
    },
    type:{
        type:String,
        default:'TEXT',
        enum:types
        },
    name:{
        type:String
         },
    description:{
         type:String,
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
    created:{
        type:String
        },     
    estado:{
        type:Boolean
        },
        text:{
            type:String
            }
 })

 contentSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 contentSchema.methods.toJSON = function () {
        let content = this;
        let contentObject = content.toObject();
        //delete contentObject.password;
        return contentObject;
 }

 module.exports = mongoose.model('Content',contentSchema);