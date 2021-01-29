const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);

 let Schema = mongoose.Schema;

 let documentIdValidos = {
     values: ['DNI','NIT','PASSPORT'],
     message:'{VALUE} no es un role valido'
 }

 let agencySchema = new Schema({
    
    name:{
        type:String,
    },
    address :{
        type:String,
        unique:true
    },
    email:{
        type:String,
        unique:true
    },
    phone:{
        type:String,
        required:[false]
    },
    documentid:{
        type:String,
        required:[false]
    },
    typedocumentid:{
        type:String,
        default:'USER_ROLE',
        enum:documentIdValidos
        },
    active:{
        type:Boolean,
        required:[false]
    },
    map:{
        type:String,
        required:[false]
    },
    description:{
        type:String,
        required:[false]
    },
    gallery:{
        type:String,
        required:[false]
    },
    socialNetwork:{
        type:String,
        required:[false]
    },
    owner:{
        type:String,
        required:[false]
    },
    userId:{
        type:Number,
        required:[false]
    }
 })

 agencySchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 agencySchema.methods.toJSON = function () {
        let agencia = this;
        let agencyObject = agencia.toObject();
        return agencyObject;
 }

 module.exports = mongoose.model('Agency',agencySchema);