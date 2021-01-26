const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const _ = require("underscore");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");

const Campaign = require("../models/campaign");

app.get("/campaign", verificarToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 0;
  limite = Number(limite);

  Campaign.find({ estado: true }, "nombre email role")
    .skip(desde)
    .limit(limite)
    .exec((err, campaigns) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Campaign.count({ nombre: "pedro" }, (err, conteo) => {
        res.json({
          ok: true,
          total: conteo,
          campaigns,
        });
      });
    });
});

app.post("/campaign", (req, res) => {
  let parametro = req.body;

  let campaign = new Campaign({
    name: parametro.name,
    active: true,
    description: parametro.description,
    userId: parametro.userId,
  });

  Campaign.save((err, campaignDB) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    // campaignDB.password = null

    res.json({
      ok: true,
      campaign: campaignDB,
    });
  });
});

app.put("/campaign/:id", verificarToken, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["nombre"]);

  Campaign.findByIdAndUpdate(id, body, { new: true }, (err, campaignDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      campaign: campaignDB,
    });
  });
});

app.delete("/campaignAdmin/:id", [verificarToken, isAdmin], (req, res) => {
  let id = req.params.id;

  Campaign.findByIdAndDelete(id, (err, campaignBorrado) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    if (!campaignBorrado) {
      res.status(400).json({
        ok: false,
        err,
        message: "campaign no encontrado",
      });
    }

    res.json({
      data: id,
    });
  });
});

let cambiaEstado = {
  estado: false,
};

app.delete("/campaign/:id", verificarToken, (req, res) => {
  let id = req.params.id;

  Campaign.findByIdAndUpdate(
    id,
    cambiaEstado,
    { new: true },
    (err, campaignDB) => {
      if (err) {
        res.status(400).json({
          ok: false,
          err,
          message: " Falla en los parametros",
        });
      }

      res.json({
        ok: true,
        message: "El campaign  fue desactivado",
        data: id,
      });
    }
  );
});

module.exports = app;
