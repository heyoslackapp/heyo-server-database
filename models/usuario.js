const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set('useFindAndModify', false);


 let Schema = mongoose.Schema;

 let rolesValidos = {
     values: ['ADMIN','USER'],
     message:'{VALUE} no es un role valido'
 }

 let usuarioSchema = new Schema({
    
    nombre:{
        type:String,
        require:[true, 'Es necesario el nombre amigo!!']
    },
    email:{
        type:String,
        required:[true, 'El Email es vital para vivir'],
        unique:true
    },
    password:{
        type:String,
        require:[true,'El password mijooooo']
    },
    img:{
        type:String,
        required:[false]
    },
    role:{
        type:String,
        default:'USER',
        enum:rolesValidos
        },
    estado:{
        type:Boolean,
        required:[false]
    },
    google:{
        type:Boolean,
        required:[false]
    },
    userId:{
        type:Number,
        required:[false]
    },
    date:{
        type:Date,
    },
    domain:{
        type:String,
        required:[false]
    },
    conferenceId:{
        type:Schema.Types.ObjectId,
        ref:'Conferences' 
    },
    description:{
        type:String,
        required:[false]
    },
    country:{
        type:String,
    },
    region:{
        type:String,
    },
    city:{
        type:String,
    },
    latitud:{
        type:String,
    },
    flag:{
        type:String,
    },
    longitud:{
        type:String,
    },
    activation:{
        type:Date,
    },
    invitation:{
        type:Boolean
    },
    invitation:{
        type:Boolean
    },status:{
        type:Boolean
    },lastUpdated:{
        type:Date
    },superadmin:{
        type:Boolean
    },
 })

 usuarioSchema.plugin( uniqueValidator , { message: '{PATH} debe ser unico'});

 usuarioSchema.methods.toJSON = function () {
        let user = this;
        let userObject = user.toObject();
        delete userObject.password;
        return userObject;
 }

 module.exports = mongoose.model('Usuario',usuarioSchema);