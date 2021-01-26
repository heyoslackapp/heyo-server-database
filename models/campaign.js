const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 let entitysValidos = {
    values: ['CONFERENCE','CONTENT','USER','SUSCRIPTION','TOUR','AGENCY','BLOG','GALLERY'],
    message:'{VALUE} no es un role valido'
}


 let campaignSchema = new Schema({
    
    name:{
        type:String,
        require:[true, 'Es necesario el name amigo!!']
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

 campaignSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 campaignSchema.methods.toJSON = function () {
        let agencia = this;
        let campaignObject = agencia.toObject();
        //delete campaignObject.password;
        return campaignObject;
 }

 module.exports = mongoose.model('Campaign',campaignSchema);