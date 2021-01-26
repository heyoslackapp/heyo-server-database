const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 let documentIdValidos = {
     values: ['DNI','NIT','PASSPORT'],
     message:'{VALUE} no es un role valido'
 }

 let ownerSchema = new Schema({
    
    name:{
        type:String,
        require:[true, 'Es necesario el name amigo!!']
    },
    address :{
        type:String,
        required:[true, 'El Email es vital para vivir'],
        unique:true
    },
    email:{
        type:String,
        required:[true, 'El Email es vital para vivir'],
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
    description:{
        type:String,
        required:[false]
    },
    avatar:{
        type:String,
        required:[false]
    },
    socialNetwork:{
        type:String,
        required:[false]
    },
    userId:{
        type:Number,
        required:[false]
    }
 })

 ownerSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 ownerSchema.methods.toJSON = function () {
        let autor = this;
        let ownerObject = autor.toObject();
        //delete ownerObject.password;
        return ownerObject;
 }

 module.exports = mongoose.model('Owner',ownerSchema);