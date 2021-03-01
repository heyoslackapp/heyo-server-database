process.env.PORT = process.env.PORT || 5000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || "env";

let urlDB;

if (process.env.NODE_ENV === "dev") {
  urlDB =
    "mongodb+srv://root:s98tiMpvCMki!T9@cluster0.u72ao.mongodb.net/heyo?retryWrites=true&w=majority";
} else {
  //urlDB = process.env.MONGO_URI;
  urlDB =
    "mongodb+srv://root:s98tiMpvCMki!T9@cluster0.u72ao.mongodb.net/heyo?retryWrites=true&w=majority";
}

process.env.urlDB = urlDB;

//============
// vencimiento del token
//===========
process.env.EXPIRATION_DATE = "48h";

//===========
// SEED TOKEN
//===========

process.env.SEED_TOKEN = "lsdrojas";

//===========
// GOOGLE CLIENTE ID PARA LA AUTENTICACION
//===========

process.env.GOOGLE_CLIENT_ID =
  "334029472076-9ujtkhlas64fagqmq4li6ejd0bta8uqm.apps.googleusercontent.com";
process.env.GOOGLE_SECRET_CLIENT_ID = "RfXql1hZbMlOx3_-9dBRe_f6";
