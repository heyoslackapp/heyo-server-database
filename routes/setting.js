const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const _ = require("underscore");
const { verificarToken } = require("../middlewares/autenticacion");
const Setting = require("../models/setting");

app.get("/setting", verificarToken, (req, res) => {

  Setting.find({ conferenceId: req.usuario.conferenceId })
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        result
      });
    });
});

app.get("/setting/:id", verificarToken, (req, res) => {
  let id = req.params.id;
  Setting.find({ conferenceId: req.usuario.conferenceId,_id:id })
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        result
      });
    });
});

app.post("/setting", verificarToken, (req, res) => {
  let parametro = req.body;

  let setting = new Setting({
    userId: req.usuario.userId,
    status: true,
    date: moment.now(),
    name:parametro.name,
    value:parametro.value,
    description:parametro.description,
    conferenceId:req.usuario.conferenceId,
  });

  setting.save((err, result) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    res.json({
      ok: true,
      result
    });
  });
});

app.put("/setting/:id",verificarToken, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["value","description","name"]);

  Setting.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      result
    });
  });
});

app.delete("/setting/:id", verificarToken, (req, res) => {
  let id = req.params.id;

  Setting.findByIdAndDelete(id, (err, result) => {
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
        message: "setting no encontrado",
      });
    }

    res.json({
      data: id,
    });
  });
});

module.exports = app;
