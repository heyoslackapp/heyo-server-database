const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const _ = require("underscore");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
const { sendEmailBasic } = require("./common.js");

const Invitation = require("../models/invitation");
const Conference = require("../models/conference");

app.get("/invitation", verificarToken, (req, res) => {
  Invitation.find({ conferenceId: req.usuario.conferenceId }).exec(
    (err, result) => {
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
    }
  );
});

app.post("/invitation", verificarToken, (req, res) => {
  let parametro = req.body;

  const code = Math.random() * 1000000000000000;

  let invitation = new Invitation({
    userId: req.usuario.userId,
    status: false,
    date: moment.now(),
    code,
    description: parametro.description,
    email: parametro.email,
    conferenceId: req.usuario.conferenceId,
  });

  invitation.save((err, result) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    Conference.findOne({ _id: req.usuario.conferenceId }).exec(
      (err, conferenceDB) => {
        sendEmailBasic({
          name: conferenceDB.title,
          email: parametro.email,
          message: `Bienvenido a ${conferenceDB.title} <br> ${conferenceDB.description} <br> <a href="https://dalive.netlify.app/signin/${code}">Registrate aquí</a> `,
        });
      }
    );

    res.json({
      ok: true,
      result,
    });
  });
});

app.put("/invitation/:id", verificarToken, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["status"]);

  Invitation.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      survey: result,
    });
  });
});

app.delete("/invitation/:id", verificarToken, (req, res) => {
  let id = req.params.id;

  Invitation.findByIdAndDelete(id, (err, result) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    if (!result) {
      res.status(400).json({
        ok: false,
        err,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      data: id,
    });
  });
});

app.post("/validateInvitation/:conferenceId", (req, res) => {
  let parametro = req.body;
  let conferenceId = req.params.conferenceId;
  const code = parametro.code;

  Invitation.findOne({ conferenceId, code, status: false }).exec(
    (err, results) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: "No hay registros",
          err,
        });
      }
      if(results){
        Invitation.findByIdAndUpdate(
          results._id,
          { preview: moment.now() },
          { new: true },
          (err, result) => {
            if (err) {
              return res.status(400).json({
                ok: false,
                err,
              });
            }
  
            res.json({
              ok: true,
              results,
            });
          }
        );  
      }else{
        return res.status(400).json({
          ok: false,
          message: "No hay registros",
          err,
        });
      }
         
    }
  );
});

app.get("/invitationTotal", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  Invitation.find({ conferenceId }).exec((err, results) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    const status = {};
    results.forEach(function (item) {
      status[item.status] = (status[item.status] || 0) + 1;
    });

    res.json({
      ok: true,
      status,
    });
  });
});

module.exports = app;
