const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
var moment = require("moment-timezone");

const Slackuser = require("../models/slackuser");
const Conversation = require("../models/conversation");

app.post("/conversationLoadGrid", (req, res) => {
  let parametro = req.body;

  Conversation.findOne({ _id: parametro.rootId }).exec((err, rootInfo) => {
    let page = parametro.page || 0;
    page = Number(page);

    let rows = parametro.rows || 0;
    rows = Number(rows);

    const AscOrDesc = parametro.sord === "asc" ? 1 : -1;

    let busqueda = { archived: null };

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

    Conversation.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      .populate("usera")
      .populate("userb")
      .exec((err, result) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        return res.json({
          ok: true,
          page,
          records: result.length,
          rows: result,
        });
      });
  });
});

app.get("/conversationDetails/:conversationId", verificarToken, (req, res) => {
  let _id = req.params.userId;
  Conversation.findOne({ _id })
    .populate("usera")
    .populate("userb")
    .exec((err, user) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        user,
      });
    });
});

app.put("/conversation/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let body = _.pick(req.body, ["state"]);

  Conversation.findByIdAndUpdate(id, body, { new: true }, (err, user) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      user,
    });
  });
});

app.get("/conversationByUser", (req, res) => {
  let p = req.query;

  Conversation.find(
    { $or: [{ codea: p.user }, { codea: p.user }] },
    async (err, result) => {
      if (err) {
        return { err, ok: false };
      }

      const usersExclude = [];

      result.forEach((item) => {
        usersExclude.push(item.codea);
        usersExclude.push(item.codeb);
      });

      await Slackuser.find(
        {
          user: { $nin: usersExclude },
          connections: { $gt: 0 },
        },
        (err, result) => {
          if (err) {
            return { err, ok: false };
          }

          return res.json({
            ok: true,
            result: result[0],
            userx: p.user,
            usery: result[0].user,
          });
        }
      );
    }
  );
});

app.get("/findUserConversationByUser", (req, res) => {
  let p = req.query;

  Conversation.find(
    { $or: [{ codea: p.user }, { codea: p.user }] },
    async (err, result) => {
      if (err) {
        return { err, ok: false };
      }

      result.forEach((item) => {
        console.log(item.codea, item.codeb);
      });

      await Slackuser.find(
        { $not: [{ user: "U013LS9KZ7S" }] },
        (err, result) => {
          if (err) {
            return { err, ok: false };
          }
        }
      );

      return res.json({
        ok: true,
        result,
      });
    }
  );
});

app.get("/testFind", (req, res) => {
  let p = req.query;
  const arrayUsers = ["U013LS9KZ7S"];
  Slackuser.find(
    {
      user: { $nin: arrayUsers },
      connections: { $gt: 2 },
    },
    (err, result) => {
      if (err) {
        return { err, ok: false };
      }

      return res.json({
        ok: true,
        result: result[0],
      });
    }
  );
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

app.put("/conversationArchived/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
  let id = req.params.id;
  let params = req.body;

  const archived = params.archived ? moment.now() : "";

  Conversation.findByIdAndUpdate(
    id,
    { archived },
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

app.put("/conversationState/:id", verificarToken, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["state"]);
  Conversation.findByIdAndUpdate(id, body, { new: true }, (err, result) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    return res.json({
      ok: true,
      result,
    });
  });
});

app.post("/userBusy22", (req, res) => {
  const { usera, userb } = req.body;
  Slackuser.findOne({ usera }, (err, useradata) => {
    if (err) {
      return { err, ok: false };
    }

    if (useradata && useradata.connections > 0) {
      //let datelimit = moment().add(4, "days");
      let connections = parseInt(useradata.connections) - 1;

      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { state: users.STATE.connected, datelimit, connections } },
        { new: true },
        (err, result) => {
          if (err) return err;
          return res.json({
            ok: true,
            result,
          });
        }
      );
    } else {
      res.json({
        ok: false,
        userdata,
      });
    }
  });
});

app.post("/conversation", (req, res) => {
  let p = req.body;

  Slackuser.find(
    { $or: [{ user: p.usera }, { user: p.userb }] },
    (err, userdata) => {
      if (err) {
        return { err, ok: false };
      }

      let conversation = new Conversation({
        usera: userdata[0]._id,
        codea: userdata[0].user,
        avatara: userdata[0].avatar,
        userb: userdata[1]._id,
        avatarb: userdata[1].avatar,
        codeb: userdata[1].user,
        state: 1,
        mode: "ok",
        created: moment.now(),
        updated: moment.now(),
      });

      conversation.save(async (err, result) => {
        if (err) {
          res.status(400).json({
            ok: false,
            err,
            message: " Falla en los parametros",
          });
        }

        await Slackuser.findByIdAndUpdate(
          userdata[0]._id,
          {
            $set: {
              // connections: parseInt(userdata[0].connections) - 1,
              datelimit: moment.now(),
              state: "2",
            },
          },
          { new: true },
          (err, result) => {
            if (err) return err;
          }
        );

        await Slackuser.findByIdAndUpdate(
          userdata[1]._id,
          {
            $set: {
              // connections: parseInt(userdata[1].connections) - 1,
              datelimit: moment.now(),
              state: "2",
            },
          },
          { new: true },
          (err, result) => {
            if (err) return err;
          }
        );

        return res.json({
          ok: true,
          result,
        });
      });
    }
  );
});

module.exports = app;
