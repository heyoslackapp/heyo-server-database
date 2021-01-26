const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const { verificarToken } = require("../middlewares/autenticacion");
var moment = require("moment-timezone");

const Guest = require("../models/guest");
const Root = require("../models/root");

app.post("/guestLoadGrid", (req, res) => {
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

    if (
      parametro.userId &&
      parametro.userId !== null &&
      parametro.userId !== "null" &&
      parametro.userId.length > 0 &&
      parametro.userId !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        userId: parametro.userId,
      };
    }

    Guest.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      .populate("userId")
      .populate("rootId")
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

app.put("/guest/:id", verificarToken, (req, res) => {
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

  Guest.findByIdAndUpdate(id, body, { new: true }, (err, guest) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      usuario: {
        ...guest._doc,
        birthdate: moment(guest.birthdate).format("YYYY/MM/DD"),
        startdate: moment(guest.startdate).format("YYYY/MM/DD"),
        closuredate: moment(guest.closuredate).format("YYYY/MM/DD"),
      },
    });
  });
});

app.post("/guest", verificarToken, (req, res) => {
  let p = req.body;
  const { instanceId, _id: rootId } = req.usuario;

  let guest = new Guest({
    password: bcrypt.hashSync(p.document, 10),
    firstname: p.firstname,
    lastname: p.lastname,
    email: p.email,
    document: p.document,
    documentType: p.documentType,
    active: p.active,
    birthdate: moment(p.birthdate).format("YYYY/MM/DD"),
    address: p.address,
    phone: p.phone,
    observation: p.observation,
    city: p.city,
    region: p.region,
    country: p.country,
    reference: p.reference,
    type: p.type,
    category: p.category,
    startdate: moment(p.startdate).format("YYYY/MM/DD HH:mm"),
    closuredate: moment(p.closuredate).format("YYYY/MM/DD HH:mm"),
    instanceId,
    rootId,
    userId: p.userId,
    refererId: p.refererId,
    role: "GUEST",
  });

  guest.save((err, result) => {
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

app.put("/guestArchived/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const archived = params.archived ? moment.now() : "";

  Guest.findByIdAndUpdate(id, { archived }, { new: true }, (err, usuario) => {
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

app.put("/guestActive/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let body = _.pick(req.body, ["active"]);
  Guest.findByIdAndUpdate(id, body, { new: true }, (err, usuario) => {
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

app.post("/guestLogin/", (req, res) => {
  let body = req.body;
  Guest.findOne({ email: body.email }, (err, usuarioDB) => {
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
      guest: usuarioDB,
      ok: true,
    });
  });
});

app.get("/guestValidate/", verificarToken, (req, res) => {
  res.json({
    ok: true,
    result: req.usuario,
  });
});

app.get("/guestDetails/:userId", verificarToken, (req, res) => {
  let _id = req.params.userId;
  Guest.findOne({ _id })
    .populate("refererId")
    .populate("rootId")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        total: result.length,
        result: {
          ...result._doc,
          birthdate: moment(result.birthdate).format("YYYY/MM/DD"),
          startdate: moment(result.startdate).format("YYYY/MM/DD"),
          closuredate: moment(result.closuredate).format("YYYY/MM/DD"),
        },
      });
    });
});

module.exports = app;
