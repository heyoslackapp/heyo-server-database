const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);
 let Schema = mongoose.Schema;
 let blogSchema = new Schema({
    
    title:{
        type:String,
        require:[true, 'Es necesario el name amigo!!']
    },
    date:{
        type:String,
        require:[false]
    },
    time:{
        type:String,
        require:[false]
    },
    active:{
        type:Boolean,
        required:[false]
    },
    subtitle:{
        type:String,
        required:[false]
    },
    metadescription:{
        type:String,
        required:[false]
    },
    gallery:{
        type:String,
        required:[false]
    },
    avatar:{
        type:String,
        required:[false]
    },
    userId:{
        type:Number,
        required:[false]
    },
    body:{
        type:String,
        required:[false]
    }
 })

 blogSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});
 blogSchema.methods.toJSON = function () {
        let agencia = this;
        let blogObject = agencia.toObject();
        //delete blogObject.password;
        return blogObject;
 }

 module.exports = mongoose.model('Blog',blogSchema);