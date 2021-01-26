const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

const System = require("../models/system");

app.get("/system/", (req, res) => {
  System.find({ conferenceId: req.usuario.conferenceId })
    .populate("Surveys", "question")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      return res.status(400).json({
        ok: false,
        err,
      });
    });
});

app.post("/system/", (req, res) => {
  let p = req.body;

  let system = new System({
    active: true,
    name: p.name,
    code: p.code,
    key: bcrypt.hashSync(p.key,10) ,
  });

  system.save((err, result) => {
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

module.exports = app;
