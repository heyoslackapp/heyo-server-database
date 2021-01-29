const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
var moment = require("moment-timezone");

const User = require("../models/user");
const Root = require("../models/root");

app.post("/userLoadGrid", (req, res) => {
  let parametro = req.body;

  Root.findOne({ _id: parametro.rootId }).exec((err, rootInfo) => {
    let page = parametro.page || 0;
    page = Number(page);

    let rows = parametro.rows || 0;
    rows = Number(rows);

    const AscOrDesc = parametro.sord === "asc" ? 1 : -1;

    let busqueda = { archived: null, instanceId: rootInfo.instanceId };

    if (
      parametro.firstname &&
      parametro.firstname !== "undefined" &&
      parametro.firstname.length > 0
    ) {
      busqueda = {
        ...busqueda,
        firstname: { $regex: ".*" + parametro.firstname + ".*" },
      };
    }
    if (
      parametro.lastname &&
      parametro.lastname.length > 0 &&
      parametro.lastname !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        lastname: { $regex: ".*" + parametro.lastname + ".*" },
      };
    }
    if (
      parametro.document &&
      parametro.document.length > 0 &&
      parametro.document !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        document: { $regex: ".*" + parametro.document + ".*" },
      };
    }
    if (
      parametro.email &&
      parametro.email.length > 0 &&
      parametro.email !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        email: { $regex: ".*" + parametro.email + ".*" },
      };
    }

    User.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      // .populate("refererId")
      .exec((err, usuarios) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          page,
          records: usuarios.length,
          rows: usuarios,
        });
      });
  });
});

app.get("/usuarioDetails/:userId", verificarToken, (req, res) => {
  let _id = req.params.userId;
  User.findOne({ _id })
    .populate("refererId")
    .exec((err, user) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        total: user.length,
        user: {
          ...user._doc,
          birthdate: moment(user.birthdate).format("YYYY/MM/DD"),
          startdate: moment(user.startdate).format("YYYY/MM/DD"),
          closuredate: moment(user.closuredate).format("YYYY/MM/DD"),
        },
      });
    });
});

app.put("/user/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let body = _.pick(req.body, [
    "category",
    "reference",
    "firstname",
    "email",
    "lastname",
    "address",
    "city",
    "country",
    "document",
    "documentType",
    "email",
    "phone",
    "observation",
    "active",
    "type",
    "closuredate",
    "startdate",
    "birthdate",
  ]);

  User.findByIdAndUpdate(id, body, { new: true }, (err, user) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      usuario: {
        ...user._doc,
        birthdate: moment(user.birthdate).format("YYYY/MM/DD"),
        startdate: moment(user.startdate).format("YYYY/MM/DD"),
        closuredate: moment(user.closuredate).format("YYYY/MM/DD"),
      },
    });
  });
});

app.post("/user", verificarToken, (req, res) => {
  let p = req.body;
  const { instanceId, _id: rootId } = req.usuario;

  let user = new User({
    password: bcrypt.hashSync(p.document, 10),
    firstname: p.firstname,
    lastname: p.lastname,
    email: p.email,
    document: p.document,
    documentType: p.documentType,
    active: p.active,
    address: p.address,
    phone: p.phone,
    observation: p.observation,
    city: p.city,
    region: p.region,
    country: p.country,
    reference: p.reference,
    type: p.type,
    category: p.category,
    startdate: moment(p.startdate).format("YYYY/MM/DD"),
    closuredate: moment(p.closuredate).format("YYYY/MM/DD"),
    birthdate: moment(p.closuredate).format("YYYY/MM/DD"),
    instanceId,
    rootId,
    refererId: p.refererId,
    role: "USER",
  });

  user.save((err, result) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    res.json({
      ok: true,
      usuario: result,
    });
  });
});

app.post("/usuarixDetails/:userId", verificarToken, (req, res) => {
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

app.put("/userArchived/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const archived = params.archived ? moment.now() : "";

  User.findByIdAndUpdate(id, { archived }, { new: true }, (err, usuario) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      usuario,
    });
  });
});

app.put("/userActive/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let body = _.pick(req.body, ["active"]);
  User.findByIdAndUpdate(id, body, { new: true }, (err, usuario) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      usuario,
    });
  });
});

app.post("/userLogin/", (req, res) => {
  let body = req.body;
  User.findOne({ email: body.email }, (err, usuarioDB) => {
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

app.get("/userValidate/", verificarToken, (req, res) => {
  res.json({
    ok: true,
    result: req.usuario,
  });
});

app.get("/userAll", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;

  User.find({ archived: null }).exec((err, result) => {
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
