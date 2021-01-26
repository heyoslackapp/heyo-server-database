const express = require("express");
const app = express();
const _ = require("underscore");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
const { generateCodeTrans } = require("../middlewares/serial");

var moment = require("moment-timezone");

const Trans = require("../models/trans");
const Root = require("../models/root");
const App = require("../models/app");

app.get("/trans/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;

  let _id = req.params.id;
  let parametro = req.body;

  Trans.findOne({ instanceId, _id })
    .populate("rootId")
    .populate("planId")
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

app.post("/trans", verificarToken, (req, res) => {
  let params = req.body;
  const { instanceId, _id: rootId } = req.usuario;

  Trans.findOne({ instanceId })
    .sort([["serial", -1]])
    .exec((err, lastTrans) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      const serial =
        lastTrans && lastTrans.serial !== null ? lastTrans.serial + 1 : 1000;

      let trans = new Trans({
        phone: params.phone,
        description: params.description,
        amount: params.amount,
        code: generateCodeTrans(serial),
        serial: serial,
        pending: params.pending,
        total: params.total,
        type: params.type || "inbound",
        mode: params.mode,
        status: params.pending === 0 ? "Completada" : "Pendiente",
        email: params.email,
        fullname: params.fullname,
        reference: params.reference,
        createdAt: moment.now(),
        lastUpdatedAt: moment.now(),
        instanceId,
        rootId,
        transId: params.transId,
        userId: params.userId,
        appId: params.appId,
        planId: params.planId,
      });

      trans.save((err, result) => {
        if (err) {
          res.status(400).json({
            ok: false,
            err,
            message: " Falla en los parametros",
          });
        }

        const body = {
          amount: params.pending,
        };

        App.findByIdAndUpdate(
          params.appId,
          body,
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
                result,
              },
            });
          }
        );
      });
    });
});

app.post("/transLoadGrid", (req, res) => {
  let parametro = req.body;

  Root.findOne({ _id: parametro.rootId }).exec((err, rootInfo) => {
    let page = parametro.page || 0;
    page = Number(page);

    let rows = parametro.rows || 0;
    rows = Number(rows);

    const AscOrDesc = parametro.sord === "asc" ? 1 : -1;

    let busqueda = { archived: null, instanceId: rootInfo.instanceId };

    if (
      parametro.description &&
      parametro.description !== "undefined" &&
      parametro.description.length > 0
    ) {
      busqueda = {
        ...busqueda,
        description: { $regex: ".*" + parametro.description + ".*" },
      };
    }
    if (
      parametro.mode &&
      parametro.mode.length > 0 &&
      parametro.mode !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        mode: { $regex: ".*" + parametro.mode + ".*" },
      };
    }
    if (
      parametro.type &&
      parametro.type.length > 0 &&
      parametro.type !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        type: { $regex: ".*" + parametro.type + ".*" },
      };
    }

    if (
      parametro.status &&
      parametro.status.length > 0 &&
      parametro.status !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        status: parametro.status,
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
      parametro.appId &&
      parametro.appId !== null &&
      parametro.appId !== "null" &&
      parametro.appId.length > 0 &&
      parametro.appId !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        appId: parametro.appId,
      };
    }

    if (
      parametro.planId &&
      parametro.planId !== null &&
      parametro.planId !== "null" &&
      parametro.planId.length > 0 &&
      parametro.planId !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        planId: parametro.planId,
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

    Trans.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      .populate("appId")
      .populate("rootId")
      .exec((err, result) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
            msg: "11",
          });
        }

        const resultFormat = result.map((item) => {
          let planInfo = item._doc.planId ? `${item._doc.planId.name} ` : "";

          let rootInfo = item._doc.rootId ? `${item._doc.rootId.email}` : "";

          let userInfo = item._doc.userId
            ? `${item._doc.userId.firstname} ${item._doc.userId.lastname}`
            : "";

          return { ...item._doc, planInfo, rootInfo, userInfo };
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

app.put("/trans/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;
  let id = req.params.id;

  const parametros = { ...req.body, lastUpdatedAt: moment.now() };

  let body = _.pick(parametros, ["description"]);

  Trans.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
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

app.put("/transArchived/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const archived = params.archived ? moment.now() : "";

  Trans.findByIdAndUpdate(id, { archived }, { new: true }, (err, result) => {
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

// Reverse is Inactive
app.put("/transActive/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;

  Trans.findByIdAndUpdate(
    id,
    { type: "outbound" },
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
        result,
      });
    }
  );
});

module.exports = app;
