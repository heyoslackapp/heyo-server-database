const express = require("express");
const app = express();
const { verificarToken } = require("../middlewares/autenticacion");
const { globals, slackConsole } = require("../middlewares/settings");

var moment = require("moment-timezone");
const axios = require("axios");
var cron = require("node-cron");

const Slackuser = require("../models/slackuser");
const Conversation = require("../models/conversation");
const { WebClient } = require("@slack/web-api");
const web = new WebClient(globals.TOKEN.slack_xoxp);

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

app.get("/findUserConversationByUser", (req, res) => {
  let p = req.query;

  Conversation.find(
    { $or: [{ codea: p.user }, { codea: p.user }] },
    async (err, result) => {
      if (err) {
        return { err, ok: false };
      }

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

app.put("/conversationChannel/:id", verificarToken, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["channel"]);

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

/* IMPORTANT */

const FindUserToConversation = async (usersExclude) => {
  const users = await Slackuser.find({
    user: { $nin: usersExclude },
    connections: { $gt: 0 }, // conexiones mayor a 0
    state: { $ne: "0" }, // status Activo
    datelimit: {
      $lte: moment(moment().format("YYYY-MM-DD")).toISOString(),
    },
  });

  if (users.length > 0) {
    const idUser = users[0].user;

    const yyy = await Slackuser.findByIdAndUpdate(
      users[0]._id,
      {
        datelimit: moment.now(),
        state: "2",
      },
      { new: true }
    );
    return idUser;
  } else {
    return null;
  }
};

app.get("/conversationByUser", (req, res) => {
  let p = req.query;
  Conversation.find(
    { $or: [{ codea: p.user }, { codeb: p.user }] },
    (err, result) => {
      if (err) {
        return { err, ok: false };
      }

      const usersExclude = [p.user];
      result.forEach((item) => {
        usersExclude.push(item.codea);
        usersExclude.push(item.codeb);
      });

      FindUserToConversation(usersExclude).then((connectionWithId) => {
        return res.json({
          ok: true,
          user: p.user,
          connectionWithId,
        });
      });
    }
  );
});

app.post("/conversationByUserByCront", (req, res) => {
  Slackuser.find(
    {
      connections: { $gt: 0 },
      state: { $ne: "0" },
      datelimit: {
        $lte: moment(moment().format("YYYY-MM-DD")).toISOString(),
      },
    },
    (err, useradata) => {
      if (err) {
        return { err, ok: false };
      }

      return res.json({
        ok: true,
        useradata,
      });
    }
  ).limit(1);
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
        created: new Date(),
        updated: new Date(),
        //channel: p.channel,
      });

      conversation.save(async (err, result) => {
        if (err) {
          res.status(400).json({
            ok: false,
            err,
            message: " Falla en los parametros",
          });
        }

        const result1 = await Slackuser.findByIdAndUpdate(
          userdata[0]._id,
          {
            $set: {
              connections: parseInt(userdata[0].connections) - 1,
              datelimit: new Date(),
              state: "2",
            },
          },
          { new: true },
          (err, result) => {
            if (err) return err;
            return result;
          }
        );

        const result2 = await Slackuser.findByIdAndUpdate(
          userdata[1]._id,
          {
            $set: {
              connections: parseInt(userdata[1].connections) - 1,
              datelimit: new Date(),
              state: "2",
            },
          },
          { new: true },
          (err, result) => {
            if (err) return err;
            return result;
          }
        );

        return res.json({
          ok: true,
          result: {
            ok: true,
            result,
          },
        });
      });
    }
  );
});

const resetUsers = () => {
  slackConsole("Reset Users");
  console.log("Reset");

  Slackuser.updateMany(
    {},
    {
      datelimit: moment().subtract(2, "day"),
      //connections: 4,
      //people: 4,
      //state: 1,
    },
    (err, result2) => {
      return result2;
    }
  );
};

setTimeout(function () {
  //resetUsers();
}, 4000);

const resetUsersConnectionsWeek = async () => {
  const users = await Slackuser.find({
    state: { $ne: "0" },
  });

  if (users.length > 0) {
    users.forEach(async (item) => {
      const xxx = await Slackuser.findByIdAndUpdate(
        item._id,
        {
          connections: item.people,
        },
        { new: true }
      );
    });

    return true;
  } else {
    return null;
  }
};

cron.schedule(globals.CRON.weekly, () => {
  resetUsersConnectionsWeek();
});

module.exports = app;
