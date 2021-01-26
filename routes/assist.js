const express = require("express");
const app = express();
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");

const Assist = require("../models/assist");

app.post("/assistsByUser", (req, res) => {

  let parametro = req.body;

  let page = parametro.page || 0;
  page = Number(page);

  let rows = parametro.rows || 0;
  rows = Number(rows);

  const AscOrDesc = parametro.sord === "asc" ? 1 : -1;

  let busqueda = { }

  
  if(parametro.type && parametro.type.length> 0){
    busqueda = {...busqueda, type: {$regex: ".*" + parametro.type + ".*"} }
  } 

  if(parametro.location && parametro.location.length> 0){
    busqueda = {...busqueda, location: {$regex: ".*" + parametro.location + ".*"} }
  } 

  if(parametro.userId && parametro.userId.length> 0){
    busqueda = {...busqueda, userId: parametro.userId }
  } 

  Assist.find(busqueda)
    .skip(0)
    .limit(rows)
    .sort([[parametro.sidx, AscOrDesc]])
     // .populate("refererId")
    .exec((err, results) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      const assists = results.map((item)=>{
        return { ...item._doc, created:moment(item._doc.created).format('LLLL') }
      })

      res.json({
        ok: true,
        page,
        records: results.length,
        rows: assists,
      });
    });
});




app.post("/assist/:userId", verificarToken, (req, res) => {
  let p = req.body;
  let userId = req.params.userId;
  
  const { instanceId, _id: rootId } = req.usuario;

  let assist = new Assist({
    userId,
    location: p.location,
    created: moment.now(),
    type:p.type,
    active:true,
    observation: p.observation,
    rootId,
    instanceId,
  });

  assist.save((err, result) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    res.json({
      ok: true,
      result,
    });
  });
});


module.exports = app;
