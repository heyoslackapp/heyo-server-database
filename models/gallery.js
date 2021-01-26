const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 let entitysValidos = {
    values: ['CONFERENCE','CONTENT','USER','SUSCRIPTION','TOUR','AGENCY','BLOG','GALLERY'],
    message:'{VALUE} no es un role valido'
}


 let gallerySchema = new Schema({
    
    url:{
        type:String,
        require:[true, 'Es necesario el url amigo!!']
    },
    active:{
        type:Boolean,
        required:[false]
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

 gallerySchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 gallerySchema.methods.toJSON = function () {
        let agencia = this;
        let galleryObject = agencia.toObject();
        //delete galleryObject.password;
        return galleryObject;
 }

 module.exports = mongoose.model('Gallery',gallerySchema);