const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const _ = require("underscore");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
const Conference = require("../models/conference");

/*
app.get('/',(req,res)=>{
    res.render('home',{
        titulo:'okokok',
        parrafo:' loremp ipsum'
    });
})*/

app.get("/conference", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;

  Conference.find({ _id: conferenceId }).exec((err, conferenceDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      conference: conferenceDB[0],
    });
  });
});

app.get("/conference/:id", (req, res) => {
  let conferenceId = req.params.id;

  Conference.find({ _id: conferenceId }).exec((err, conferenceDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      conference: conferenceDB[0],
    });
  });
});

app.post("/conferencePublic/:id", (req, res) => {
  let conferenceId = req.params.id;


  Conference.find({ _id: conferenceId }).exec((err, conferenceDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    //serverSocket.conference('conference', conferenceDB[0]);

    res.json({
      ok: true,
      conference: conferenceDB[0],
    });
  });
});

app.post("/conference", verificarToken, (req, res) => {
  let parametro = req.body;


  let conference = new Conference({
    name: parametro.name,
    email: parametro.email,
    phone: parametro.phone,
    address: parametro.address,
    description: parametro.description,
    gallery: parametro.gallery,
    socialNetwork: parametro.socialNetwork,
    owner: parametro.owner,
    date: moment.now(),
    schedulle: parametro.schedulle,
    time: parametro.time,
    active: true,
    map: parametro.map,
    userId: parametro.userId,
  });

  conference.save((err, conferenceDB) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    // conferenceDB.password = null

    res.json({
      ok: true,
      conference: conferenceDB,
    });
  });
});

app.put("/conference/",verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;

    let body = _.pick(req.body, [
      "name",
      "description",
      "background",
      "logo",
      "cover",
      "email",
      "speakers",
      "scheduleDate",
      "scheduleTime",
      "facebook",
      "instagram",
      "youtube",
      "urlVideoEn",
      "urlVideoEs"
    ]);

  
    Conference.findByIdAndUpdate(conferenceId, body, { new: true }, (err, conferenceDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }
  
      global.socket.emit("conference-update",conferenceDB);

      res.json({
        ok: true,
        conference: conferenceDB,
      });
    });
  });
  
app.put("/conference/:id", (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, [
    "title",
    "subtitle",
    "background",
    "logo",
    "cover",
    "primary",
    "secondary",
    "email",
    "speakers",
    "scheduleDate",
    "scheduleTime",
    "facebook",
    "instagram",
    "youtube",
    "urlVideoEn",
    "urlVideoEs"
  ]);

  Conference.findByIdAndUpdate(id, body, { new: true }, (err, conferenceDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      conference: conferenceDB,
    });
  });
});

app.put("/conferenceActive/", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  let body = _.pick(req.body, ["active"]);

  Conference.findByIdAndUpdate(
    conferenceId,
    body,
    { new: true },
    (err, conferenceDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        conference: conferenceDB,
      });
    }
  );
});

app.put("/conferenceSync/", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  let body = _.pick(req.body, ["sync"]);

  Conference.findByIdAndUpdate(
    conferenceId,
    body,
    { new: true },
    (err, conferenceDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        conference: conferenceDB,
      });
    }
  );
});

app.delete("/conferenceAdmin/:id", [verificarToken, isAdmin], (req, res) => {
  let id = req.params.id;

  Conference.findByIdAndDelete(id, (err, conferenceBorrado) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    if (!conferenceBorrado) {
      res.status(400).json({
        ok: false,
        err,
        message: "conference no encontrado",
      });
    }

    res.json({
      data: id,
    });
  });
});

let cambiaEstado = {
  active: false,
};

app.delete("/conference/:id", verificarToken, (req, res) => {
  let id = req.params.id;

  Conference.findByIdAndUpdate(
    id,
    cambiaEstado,
    { new: true },
    (err, conferenceDB) => {
      if (err) {
        res.status(400).json({
          ok: false,
          err,
          message: " Falla en los parametros",
        });
      }

      res.json({
        ok: true,
        message: "El conference  fue desactivado",
        data: id,
      });
    }
  );
});

module.exports = app;
