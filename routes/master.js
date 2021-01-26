const express = require("express");
const app = express();
const { verificarToken } = require("../middlewares/autenticacion");
const Master = require("../models/master");
const Root = require("../models/root");
const _ = require("underscore");

app.post("/masterLoadGrig", (req, res) => {
  let parametro = req.body;

  Root.findOne({ _id: parametro.rootId }).exec((err, masterUser) => {
    let page = parametro.page || 0;
    page = Number(page);

    let rows = parametro.rows || 0;
    rows = Number(rows);

    const AscOrDesc = parametro.sord === "asc" ? 1 : -1;

    let busqueda = { fatherId: masterUser.instanceId, archived: null };

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
      parametro.value &&
      parametro.value !== "undefined" &&
      parametro.value.length > 0
    ) {
      busqueda = {
        ...busqueda,
        value: { $regex: ".*" + parametro.value + ".*" },
      };
    }

    if (
      parametro.description &&
      parametro.description !== "undefined" &&
      parametro.description.length > 0
    ) {
      busqueda = { ...busqueda, description: parametro.description };
    }

    if (parametro.fatherId && parametro.fatherId.length > 0) {
      busqueda = { ...busqueda, fatherId: parametro.fatherId };
    }

    Master.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      .populate("masterId")
      .exec((err, results) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        const masterRows = results.map((item) => {
          return {
            ...item._doc,
            created: moment(item._doc.created).format("LLLL"),
          };
        });

        res.json({
          ok: true,
          page,
          records: results.length,
          rows: masterRows,
        });
      });
  });
});

app.post("/master/", verificarToken, (req, res) => {
  let p = req.body;
  const { instanceId, _id: rootId } = req.usuario;
  let master = new Master({
    fatherId: p.fatherId.length < 1 ? instanceId : p.fatherId,
    created: moment.now(),
    name: p.name,
    value: p.value,
    active: true,
    description: p.description,
    rootId,
    instanceId,
  });

  master.save((err, result) => {
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

app.get("/master/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;
  let masterId = req.params.id;

  Master.findOne({ instanceId, _id: masterId })
    .populate("rootId")
    .populate("fatherId")
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

app.put("/master/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;
  let id = req.params.id;
  let body = _.pick(req.body, ["name", "value", "description"]);

  Master.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
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

app.put("/masterArchived/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const archived = params.archived ? moment.now() : "";

  Master.findByIdAndUpdate(id, { archived }, { new: true }, (err, result) => {
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

app.put("/masterActive/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const active = params.active;

  Master.findByIdAndUpdate(id, { active }, { new: true }, (err, result) => {
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
