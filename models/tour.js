const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);

 let Schema = mongoose.Schema;

 let tourSchema = new Schema({
    
    name:{
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
    address :{
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
    items:{
        type:String,
        required:[false]
    },
    website:{
        type:String,
        required:[false]
    },
    formID:{
        type:String,
        required:[false]
    },
    metadescription:{
        type:String,
        required:[false]
    },
    userId:{
        type:Number,
        required:[false]
    },
    free:{
        type:Boolean,
        required:[false]
    },
    schedulle:{
        type:String,
        required:[false]
    },
    days:{
        type:String,
        required:[false]
    },
    price:{
        type:Number,
        required:[false]
    },
    max:{
        type:Number,
        required:[false]
    },
    min:{
        type:Number,
        required:[false]
    },
    categoryId:{
        type:Number,
        required:[false]
    },
    tags:{
        type:String,
        required:[false]
    },
    body:{
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
    }
 })

 tourSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 tourSchema.methods.toJSON = function () {
        let agencia = this;
        let tourObject = agencia.toObject();
        //delete tourObject.password;
        return tourObject;
 }

 module.exports = mongoose.model('Tour',tourSchema);