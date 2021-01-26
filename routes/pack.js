const express = require("express");
const app = express();
const _ = require("underscore");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
var moment = require("moment-timezone");

const Pack = require("../models/pack");
const Root = require("../models/root");

app.get("/pack/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;

  let _id = req.params.id;
  let parametro = req.body;

  Pack.findOne({ instanceId, _id })
    .populate("rootId")
    .sort([["date", -1]])
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
});

app.post("/pack", verificarToken, (req, res) => {
  let params = req.body;
  const { instanceId, _id: rootId } = req.usuario;

  let pack = new Pack({
    name: params.name,
    tag: params.tag,
    duration: params.duration,
    contact: params.contact,
    maxLimit: params.maxLimit,
    minLimit: params.minLimit,
    startdate: moment(params.startdate).format("YYYY/MM/DD HH:mm"),
    closuredate: moment(params.closuredate).format("YYYY/MM/DD HH:mm"),
    price: params.price,
    public: params.public,
    active: params.active,
    departurePlace: params.departurePlace,
    url: params.url,
    phone: params.phone,
    featureImage: params.featureImage,
    type: params.type,
    // storage: params.storage,
    // cupon: params.cupon,
    //  thumb: params.thumb,
    category: params.category,
    // emailConfirmation: params.emailConfirmation,
    //  emailWelcome: params.emailWelcome,
    // emailRegistration: params.emailRegistration,
    // emailClosure: params.emailClosure,
    // summary: params.summary,
    //  iframeMap: params.iframeMap,
    createdAt: moment.now(),
    lastUpdatedAt: moment.now(),
    instanceId,
    rootId,
  });

  pack.save((err, result) => {
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

app.post("/packLoadGrid", (req, res) => {
  let parametro = req.body;

  Root.findOne({ _id: parametro.rootId }).exec((err, rootInfo) => {
    let page = parametro.page || 0;
    page = Number(page);

    let rows = parametro.rows || 0;
    rows = Number(rows);

    const AscOrDesc = parametro.sord === "asc" ? 1 : -1;

    let busqueda = { archived: null, instanceId: rootInfo.instanceId };

    if (
      parametro.name &&
      parametro.name !== "undefined" &&
      parametro.name.length > 0
    ) {
      busqueda = {
        ...busqueda,
        name: { $regex: ".*" + parametro.name + ".*" },
      };
    }
    if (
      parametro.description &&
      parametro.description.length > 0 &&
      parametro.description !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        description: { $regex: ".*" + parametro.description + ".*" },
      };
    }
    if (
      parametro.category &&
      parametro.category.length > 0 &&
      parametro.category !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        category: { $regex: ".*" + parametro.category + ".*" },
      };
    }

    if (
      parametro.active &&
      parametro.active.length > 0 &&
      parametro.active !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        active: parametro.active,
      };
    }

    if (
      parametro.public &&
      parametro.public.length > 0 &&
      parametro.public !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        public: parametro.public,
      };
    }
    Pack.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      .exec((err, result) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          page,
          records: result.length,
          rows: result,
        });
      });
  });
});

app.put("/pack/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;
  let id = req.params.id;

  const parametros = {
    ...req.body,
    lastUpdatedAt: moment.now(),
    startdate: moment(req.body.startdate).format("YYYY/MM/DD"),
    closuredate: moment(req.body.closuredate).format("YYYY/MM/DD"),
  };
  let body = _.pick(parametros, [
    "name",
    "description",
    "active",
    "public",
    "category",
    "lastUpdatedAt",
    "startdate",
    "observation",
    "closuredate",
    "type"
  ]);

  Pack.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
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


app.put("/packContent/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;
  let id = req.params.id;

  const parametros = {
    ...req.body,
    lastUpdatedAt: moment.now(),
    startdate: moment(req.body.startdate).format("YYYY/MM/DD"),
    closuredate: moment(req.body.closuredate).format("YYYY/MM/DD"),
  };
  let body = _.pick(parametros, [
    "name",
    "category",
    "body",
    "public",
    "tag",
    "active",
    "featureImage",
    "startdate",
    "closuredate"
  ]);

  Pack.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
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




app.put("/packArchived/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const archived = params.archived ? moment.now() : "";

  Pack.findByIdAndUpdate(id, { archived }, { new: true }, (err, result) => {
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

app.put("/packActive/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const active = params.active;

  Pack.findByIdAndUpdate(id, { active }, { new: true }, (err, result) => {
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

app.get("/packAll", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;

  Pack.find({ instanceId, archived: null })
    //.populate("rootId")
    //.sort([["date", -1]])
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
});

module.exports = app;
