const express = require("express");
const app = express();
const _ = require("underscore");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
const { generateCodeApp } = require("../middlewares/serial");

var moment = require("moment-timezone");

const App = require("../models/app");
const Root = require("../models/root");
const Plan = require("../models/plan");
const AppStatus = require("../models/appStatus");

app.get("/app/:id", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;

  let _id = req.params.id;
  let parametro = req.body;

  App.findOne({ instanceId, _id })
    .populate("rootId")
    .populate("packId")
    .populate("planId")
    .populate("userId")
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

app.post("/app", verificarToken, (req, res) => {
  let params = req.body;
  const { instanceId, _id: rootId } = req.usuario;

  if (params.planId) {
    App.findOne({ instanceId })
      .sort([["serial", -1]])
      .exec((err, lastApp) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        const serial =
          lastApp && lastApp.serial !== null ? lastApp.serial + 1 : 1000;

        const userId = params.userId._id || params.userId;

        Plan.findOne({ _id: params.planId, instanceId }).exec(
          (err, planInfo) => {
            let app = new App({
              observation: params.observation,
              serial,
              code: generateCodeApp(serial),
              createdAt: moment.now(),
              lastUpdatedAt: moment.now(),
              planId: params.planId,
              startdate: moment(params.startdate).format("YYYY/MM/DD"),
              closuredate: moment(params.closuredate).format("YYYY/MM/DD"),
              userId,
              status: params.status || "Aprobada",
              packId: planInfo.packId,
              amount: params.price || planInfo.price,
              instanceId,
              rootId,
            });

            app.save((err, result) => {
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
          }
        );
      });
  } else {
    return res.status(400).json({
      ok: false,
      message: "El planId es requerido",
    });
  }
});

app.post("/appLoadGrid", (req, res) => {
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
      parametro.userId &&
      parametro.userId.length > 0 &&
      parametro.userId !== "null" &&
      parametro.userId !== null &&
      parametro.userId !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        userId: parametro.userId,
      };
    }

    if (
      parametro.planId &&
      parametro.planId.length > 0 &&
      parametro.planId !== "null" &&
      parametro.planId !== null &&
      parametro.planId !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        planId: parametro.planId,
      };
    }

    App.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      .populate("userId")
      .populate("planId")
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
          let user = item._doc.userId
            ? `${item._doc.userId.firstname} ${item._doc.userId.lastname}`
            : "";

          let pack = item._doc.packId
            ? `${item._doc.packId.name} ${item._doc.packId.duration}`
            : "";

          let plan = item._doc.planId
            ? `${item._doc.planId.name} ${item._doc.planId.duration}`
            : "";

          return {
            ...item._doc,
            userInfo: user,
            packInfo: pack,
            planInfo: plan,
          };
        });

        res.json({
          ok: true,
          page,
          records: result.length,
          rows: resultFormat,
        });
      });
  });
});

app.post("/appLoadGridByUser", (req, res) => {
  let parametro = req.body;

  Root.findOne({ _id: parametro.rootId }).exec((err, rootInfo) => {
    let page = parametro.page || 0;
    page = Number(page);

    if (parametro.userId.length < 1 && parametro.planId.length < 1) {
      res.json({
        ok: true,
        page,
        records: 0,
        rows: [],
      });
      return true;
    }

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
      parametro.userId &&
      parametro.userId.length > 0 &&
      parametro.userId !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        userId: parametro.userId,
      };
    }

    if (
      parametro.planId &&
      parametro.planId.length > 0 &&
      parametro.planId !== "undefined"
    ) {
      busqueda = {
        ...busqueda,
        planId: parametro.planId,
      };
    }

    console.log(busqueda);

    App.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      .populate("userId")
      .populate("planId")
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
          let user = item._doc.userId
            ? `${item._doc.userId.firstname} ${item._doc.userId.lastname}`
            : "";

          let pack = item._doc.packId
            ? `${item._doc.packId.name} ${item._doc.packId.duration}`
            : "";
          return { ...item._doc, userInfo: user, packInfo: pack };
        });

        res.json({
          ok: true,
          page,
          records: result.length,
          rows: resultFormat,
        });
      });
  });
});

app.put("/app/:id", verificarToken, (req, res) => {
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
    "minLimit",
    "maxLimit",
    "active",
    "public",
    "featureImage",
    "category",
    "lastUpdatedAt",
    "startdate",
    "planId",
    "userId",
    "closuredate",
  ]);

  App.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
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

app.put("/appArchived/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const archived = params.archived ? moment.now() : "";

  App.findByIdAndUpdate(id, { archived }, { new: true }, (err, result) => {
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

app.put("/appActive/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const active = params.active;

  App.findByIdAndUpdate(id, { active }, { new: true }, (err, result) => {
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

app.post("/appStatus/:id", verificarToken, (req, res) => {
  let params = req.body;
  const { instanceId, _id: rootId } = req.usuario;

  let appStatus = new AppStatus({
    status: params.status,
    observation: params.observation,
    packId: params.packId,
    planId: params.planId,
    createdAt: moment.now(),
    instanceId,
    rootId,
  });

  appStatus.save((err, result) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    App.findByIdAndUpdate(
      { _id: params._id, instanceId },
      {
        status: params.status,
        statusObservation: params.observation,
        statusCreatedAt: moment.now(),
      },
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
});

app.get("/appAll", verificarToken, (req, res) => {
  const { instanceId, _id: rootId } = req.usuario;

  App.find({ instanceId })
    .populate("planId")
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
