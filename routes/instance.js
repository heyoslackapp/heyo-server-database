const express = require("express");
const app = express();

const { verificarToken, isAdmin } = require("../middlewares/autenticacion");

const bcrypt = require("bcrypt");

const Instance = require("../models/instance");

app.get("/instanceByAlias/:alias", (req, res) => {
  let alias = req.params.alias;
  console.log(alias);
  Instance.findOne({ alias })
    //.populate("System", "system")
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

  /*
  System.find({ instanceId })
    .populate("System", "system")
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

  */
});

app.post("/instance/", (req, res) => {
  let p = req.body;

  let instance = new Instance({
    name: p.name,
    alias: p.alias,
    systemId: p.systemId,
    key: bcrypt.hashSync(`${p.systemId}${p.alias}`, 10),
  });

  instance.save((err, result) => {
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

app.put("/instance/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;

  const parametros = {
    ...req.body,
    lastUpdatedAt: moment.now(),
  };
  let body = _.pick(parametros, [
    "color",
    "background",
    "name",
    "email",
    "phone",
    "facebook",
    "instagram",
    "youtube",
    "website",
  ]);

  Instance.findByIdAndUpdate(instanceId, body, { new: true }, (err, result) => {
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

app.get("/instance/:id", verificarToken, (req, res) => {
  const { instanceId } = req.usuario;

  Instance.findOne({ _id: instanceId }).exec((err, result) => {
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

module.exports = app;
