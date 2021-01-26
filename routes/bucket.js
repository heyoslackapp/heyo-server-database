const express = require("express");
const app = express();
const fs = require("fs");
const _ = require("underscore");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
moment = require("moment");
const multer = require("multer");
var webp = require("webp-converter");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + Math.floor(Math.random() * 10000)
    );
  },
});

var upload = multer({ storage: storage });

const Bucket = require("../models/bucket");
const Root   = require("../models/root");
const Pack   = require("../models/pack");
const Plan   = require("../models/plan");
const User   = require("../models/user");


function callback(err) {
  if (err) throw err;
  console.log('source.txt was copied to destination.txt');
}

const deleteImage = (path) => {
  fs.link(path);
}

app.post(
  "/bucket/:id/:entity/:entityId/:type",
  upload.single("picture"),
  (req, res) => {
    let instanceId = req.params.id;
    let entity = req.params.entity;
    let entityId = req.params.entityId;
    let type = req.params.type;

    let urlDirImage = `./public/uploads/${instanceId}`;
    let urlImageDraft = `./public/uploads/${req.file.filename}`;
    let urlDirImageFinal = `./public/uploads/${instanceId}/${req.file.filename}`;

     fs.mkdirSync(urlDirImage,{recursive:true});
  
 
    const img = fs.readFileSync(req.file.path);
    const encode_image = img.toString("base64");
    const finalImg = {
      contentType: req.file.mimetype,
      image: new Buffer(encode_image, "base64"),
    };
    
    fs.copyFile(urlImageDraft, urlDirImageFinal, (err) => console.log(err));
    fs.unlink(urlImageDraft, (err) => console.log(err));

    let bucketData = { 
      contentType: req.file.mimetype,
      image: req.file.filename,
      entity,
      type,
      createdAt: moment.now(),
      instanceId,
    }

    if(entity==="Pack"){
      bucketData = { ...bucketData, packId: entityId } 
    }

    if(entity==="App"){
      bucketData = { ...bucketData, appId: entityId } 
    }

    if(entity==="User"){
      bucketData = { ...bucketData, appId: entityId } 
    }

    if(entity==="Plan"){
      bucketData = { ...bucketData, planId: entityId } 
    }


    let bucket = new Bucket(bucketData);

    bucket.save(finalImg, (err, result) => {
      if (err) return console.log(err);

      if((entity==="Pack") &&  (type=="Avatar")){


        Pack.findByIdAndUpdate(entityId, { avatar: result.image }, { new: true }, (err, result2) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              err,
            });
          }
      
          res.json({
            ok: true,
            result,
          });
        }); 

      }else if((entity==="Plan") &&  (type=="Avatar")){

        Plan.findByIdAndUpdate(entityId, { avatar: result.image }, { new: true }, (err, result2) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              err,
            });
          }
      
          res.json({
            ok: true,
            result,
          });
        }); 


      }else if(entity==="User"){


      }else{
        res.json({
          ok: true,
          result,
        });
      }
     

   

    });
  }
);

app.post("/bucketLoadGrid", (req, res) => {
  let parametro = req.body;

  Root.findOne({ _id: parametro.rootId }).exec((err, rootInfo) => {
    let page = parametro.page || 0;
    page = Number(page);

    let rows = parametro.rows || 0;
    rows = Number(rows);

    const AscOrDesc = parametro.sord === "asc" ? 1 : -1;

    let busqueda = { archived: null, instanceId: rootInfo.instanceId };

    if (
      parametro.image &&
      parametro.image.length > 0 &&
      parametro.image !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        image: { $regex: ".*" + parametro.image + ".*" },
      };
    }

    if (
      parametro.packId &&
      parametro.packId.length > 0 &&
      parametro.packId !== "undefined" &&
      parametro.packId !== "null" &&
      parametro.packId !== null
    ) {
      busqueda = {
        ...busqueda,
        packId: parametro.packId,
      };
    }

    if (
      parametro.planId &&
      parametro.planId.length > 0 &&
      parametro.planId !== "undefined" &&
      parametro.planId !== "null" &&
      parametro.planId !== null
    ) {
      busqueda = {
        ...busqueda,
        planId: parametro.planId,
      };
    }

    if (
      parametro.userId &&
      parametro.userId.length > 0 &&
      parametro.userId !== "undefined" &&
      parametro.userId !== "null" &&
      parametro.userId !== null
    ) {
      busqueda = {
        ...busqueda,
        userId: parametro.userId,
      };
    }

    Bucket.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      .exec((err, result) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          page,
          records: result.length,
          rows: result,
        });
      });
  });
});

app.put("/bucketArchived/:id", verificarToken, (req, res) => {
  let id = req.params.id;
  let params = req.body;

  const archived = params.archived ? moment.now() : "";

  Bucket.findByIdAndUpdate(id, { archived }, { new: true }, (err, result) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      result,
    });
  });
});

app.get("/bucket/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;

  let _id = req.params.id;

  Bucket.findOne({ instanceId, _id })
    .populate("rootId")
  //  .sort([["createdAt", -1]])
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        result,
      });
    });
});

app.put("/bucket/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;
  let id = req.params.id;

  const parametros = {
    ...req.body,
    lastUpdatedAt: moment.now()
  };

  let body = _.pick(parametros, [
    "title",
    "description",
    "public",
    "type",
    "active"
  ]);


  Bucket.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      result: {
        ...result._doc,
      },
    });
  });
});

module.exports = app;
