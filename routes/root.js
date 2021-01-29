const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
var moment = require("moment-timezone");

const Root = require("../models/root");

app.post("/rootLogin/", (req, res) => {
  let body = req.body;
  Root.findOne({ login: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: true,
        message: "Error en el email ",
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: true,
        message: " Usuario o (Password) Incorrecto ",
      });
    }

    let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED_TOKEN, {
      expiresIn: process.env.EXPIRATION_DATE,
    });

    res.json({
      token,
      user: usuarioDB,
      ok: true,
    });
  });
});

app.get("/root/:id", (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  let userId = req.params.userId;
  let parametro = req.body;

  // const start = parametro.start;
  // const end = parametro.end;
  //  date: { $gte: start, $lt: end }

  UserEvent.find({ conferenceId, userId })
    .populate("questionId")
    .populate("surveyId")
    .populate("userId")
    .sort([["date", -1]])
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      const country = {};
      usuarios.forEach(function (item) {
        country[item.country] = (country[item.country] || 0) + 1;
      });

      const city = {};
      usuarios.forEach(function (item) {
        city[item.city] = (city[item.city] || 0) + 1;
      });

      const region = {};
      usuarios.forEach(function (item) {
        region[item.region] = (region[item.region] || 0) + 1;
      });

      res.json({
        ok: true,
        usuarios,
        country,
        city,
        region,
      });
    });
});

app.post("/root", (req, res) => {
  let p = req.body;

  let root = new Root({
    email: p.email,
    password: bcrypt.hashSync(p.password, 10),
    role: p.role,
    systemId: p.systemId,
    date: moment.now(),
  });

  root.save((err, usuarioDB) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    // usuarioDB.password = null

    res.json({
      ok: true,
      usuario: usuarioDB,
    });
  });
});

app.get("/rootValidate/", verificarToken, (req, res) => {
  res.json({
    ok: true,
    result: req.usuario,
  });
});

app.put("/profile/:id", verificarToken, (req, res) => {
  const { instanceId, _id } = req.usuario;

  const parametros = { ...req.body, lastUpdatedAt: moment.now() };

  let body = _.pick(parametros, [
    "firstname",
    "lastname",
    "document",
    "documentType",
    "active",
    "email",
    "avatar",
    "description",
    "phone",
    "lastUpdatedAt",
  ]);

  Root.findByIdAndUpdate(
    { instanceId, _id },
    body,
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
        result: {
          ...result._doc,
        },
      });
    }
  );
});

app.put("/profilePassword/:id", verificarToken, (req, res) => {
  const { instanceId, _id, email } = req.usuario;
  let params = req.body;

  console.log(req.usuario);

  Root.findOne({ email }, (err, result) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!result) {
      return res.status(400).json({
        ok: true,
        message: "Error en el email ",
      });
    }

    if (!bcrypt.compareSync(params.oldPassword, result.password)) {
      return res.status(400).json({
        ok: true,
        message: " Usuario o (Password) Incorrecto ",
      });
    }

    const parametros = {
      password: bcrypt.hashSync(params.password, 10),
      lastUpdatedAt: moment.now(),
    };

    Root.findByIdAndUpdate(
      { instanceId, _id },
      parametros,
      { new: true },
      (err, result2) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          result: {
            ...result2._doc,
          },
        });
      }
    );
  });
});

app.get("/profile/:id", verificarToken, (req, res) => {
  const { instanceId, _id } = req.usuario;

  Root.findOne({ instanceId, _id }).exec((err, result) => {
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
