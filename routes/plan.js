const express = require("express");
const app = express();
const _ = require("underscore");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
var moment = require("moment-timezone");

const Plan = require("../models/plan");
const Root = require("../models/root");

app.get("/plan/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;

  let _id = req.params.id;
  let parametro = req.body;

  Plan.findOne({ instanceId, _id })
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

app.post("/plan", verificarToken, (req, res) => {
  let params = req.body;
  const { instanceId, _id: rootId } = req.usuario;

  let plan = new Plan({
    name: params.name,
    tag: params.tag,
    contact: params.contact,
    maxLimit: params.maxLimit,
    body: params.body,
    bodyResponsive: params.bodyResponsive,
    public: params.public,
    active: params.active,
    startdate: moment(params.startdate).format("YYYY/MM/DD HH:mm"),
    closuredate: moment(params.closuredate).format("YYYY/MM/DD HH:mm"),
    departurePlace: params.departurePlace,
    url: params.url,
    featureImage: params.featureImage,
    category: params.category,
    type: params.type,
    createdAt: moment.now(),
    lastUpdatedAt: moment.now(),
    instanceId,
    rootId,
    packId: params.packId,
  });

  plan.save((err, result) => {
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

app.post("/planLoadGrid", (req, res) => {
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

    if (
      parametro.packId &&
      parametro.packId.length > 0 &&
      parametro.packId !== "undefined" &&
      parametro.packId !== "null" &&
      parametro.packId !== null
    ) {
      busqueda = {
        ...busqueda,
        packId: parametro.packId,
      };
    }

    Plan.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      .populate("packId")
      .populate("rootId")
      .exec((err, result) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        const resultFormat = result.map((item) => {
          let packInfo = item._doc.packId
            ? `${item._doc.packId.name}`
            : "";

          
          let color = item._doc.packId && item._doc.packId.color ? `${item._doc.packId.color}` : "#FCFCFC";
          let rootInfo = item._doc.rootId ? `${item._doc.rootId.email}` : "";
          return { ...item._doc, packInfo, rootInfo, color };
        });

        res.json({
          ok: true,
          page,
          records: resultFormat.length,
          rows: resultFormat,
        });
      });
  });
});

app.put("/plan/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;
  let id = req.params.id;

  const parametros = {
    ...req.body,
    lastUpdatedAt: moment.now(),
    startdate: moment(req.body.startdate).format("YYYY/MM/DD HH:mm"),
    closuredate: moment(req.body.closuredate).format("YYYY/MM/DD HH:mm"),
  };

  let body = _.pick(parametros, [
    "name",
    "duration",
    "description",
    "body",
    "bodyResponsive",
    "minLimit",
    "maxLimit",
    "active",
    "price",
    "public",
    "featureImage",
    "departurePlace",
    "category",
    "observation",
    "lastUpdatedAt",
    "startdate",
    "closuredate",
    "packId",
    "tag",
    "position"
  ]);

  Plan.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
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

app.put("/planArchived/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const archived = params.archived ? moment.now() : "";

  Plan.findByIdAndUpdate(id, { archived }, { new: true }, (err, result) => {
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

app.put("/planActive/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const active = params.active;

  Plan.findByIdAndUpdate(id, { active }, { new: true }, (err, result) => {
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

app.put("/planContent/:id", verificarToken, (req, res) => {
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

  Plan.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
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




app.get("/planAll", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;

  Plan.find({ instanceId, archived: null }).exec((err, result) => {
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
