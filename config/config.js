process.env.PORT = process.env.PORT || 5000;
process.env.NODE_ENV = process.env.NODE_ENV || "env";

let urlDB =
  "mongodb+srv://root:s98tiMpvCMki!T9@heyo.ls0xd.mongodb.net/heyo?retryWrites=true&w=majority";

if (process.env.NODE_ENV === "dev") {
  urlDB =
    // "mongodb+srv://root:s98tiMpvCMki!T9@cluster0.u72ao.mongodb.net/heyo?retryWrites=true&w=majority";
    "mongodb+srv://root:s98tiMpvCMki!T9@heyo.ls0xd.mongodb.net/heyo?retryWrites=true&w=majority";
}

process.env.urlDB = urlDB;

//============
// vencimiento del token
//===========
process.env.EXPIRATION_DATE = "48h";

//===========
// SEED TOKEN
//===========

process.env.SEED_TOKEN = "heyoapp";
