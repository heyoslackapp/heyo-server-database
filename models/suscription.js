const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;



 let suscriptionSchema = new Schema({
    
    planId:{
        type:String,
        require:[true, 'Es necesario el tipo de plan!!']
    },
    name:{
        type:String,
        require:[true, 'Es necesario el name amigo!!']
    },price:{
        type:String,
        require:[true, 'Es necesario el price amigo!!']  
    },
    date:{
        type:String,
        require:[false]
    },
    time:{
        type:String,
        require:[false]
    },
    address:{
        type:String,
        required:[false]
        },
    email:{
        type:String,
        required:[false]
    },
    phone:{
        type:String,
        required:[false]
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
    },avatar:{
        type:String,
        required:[false]
    },
    socialNetwork:{
        type:String,
        required:[false]
    },
    items:{
        type:String,
        required:[false]
    },website:{
        type:String,
        required:[false]
    },formID:{
        type:String,
        required:[false]
    },metadescription:{
        type:String,
        required:[false]
    },
    userId:{
        type:Number,
        required:[false]
    }
 })

 suscriptionSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 suscriptionSchema.methods.toJSON = function () {
        let agencia = this;
        let suscriptionObject = agencia.toObject();
        //delete suscriptionObject.password;
        return suscriptionObject;
 }

 module.exports = mongoose.model('Suscription',suscriptionSchema);