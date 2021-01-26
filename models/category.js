const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 let entitysValidos = {
    values: ['CONFERENCE','CONTENT','USER','SUSCRIPTION','TOUR','AGENCY','BLOG','GALLERY'],
    message:'{VALUE} no es un role valido'
}


 let categorySchema = new Schema({
    
    name:{
        type:String,
        require:[true, 'Es necesario el name amigo!!']
    },
    active:{
        type:Boolean,
        required:[false]
    },
    entity:{
        type:String,
        default:'CONFERENCE',
        enum:entitysValidos
    },
    description:{
        type:String,
        required:[false]
    },
    userId:{
        type:Number,
        required:[false]
    }
 })

 categorySchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 categorySchema.methods.toJSON = function () {
        let agencia = this;
        let categoryObject = agencia.toObject();
        //delete categoryObject.password;
        return categoryObject;
 }

 module.exports = mongoose.model('Category',categorySchema);