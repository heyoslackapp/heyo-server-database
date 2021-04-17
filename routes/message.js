const express = require("express");
const app = express();
const { verificarToken } = require("../middlewares/autenticacion");
var moment = require("moment-timezone");

const Message = require("../models/message");
const Conversation = require("../models/conversation");
const slackuser = require("../models/slackuser");

app.post("/messageLoadGrid", (req, res) => {
  let parametro = req.body;

  Message.findOne({ _id: parametro.rootId }).exec((err, rootInfo) => {
    let page = parametro.page || 0;
    page = Number(page);

    let rows = parametro.rows || 0;
    rows = Number(rows);

    const AscOrDesc = parametro.sord === "asc" ? 1 : -1;

    let busqueda = { archived: null };

    if (
      parametro.conversationId &&
      parametro.conversationId !== "undefined" &&
      parametro.conversationId.length > 0
    ) {
      busqueda = {
        ...busqueda,
        conversation: parametro.conversationId,
      };
    } else {
      return res.json({
        ok: false,
      });
    }

    console.log(busqueda);

    Message.find(busqueda)
      .skip(0)
      .limit(rows)
      .sort([[parametro.sidx, AscOrDesc]])
      .populate("conversation")
      .populate("user")

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

app.get("/messageByChannel", (req, res) => {
  let p = req.query;

  Message.find({ channel: p.channel }, async (err, result) => {
    if (err) {
      return { err, ok: false };
    }

    return res.json({
      ok: true,
      result,
    });
  });
});

app.put("/messageChannel/:id", verificarToken, (req, res) => {
  // console.log(req.usuario);
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

/* important */
app.post("/message", (req, res) => {
  console.log(req.body);
  let p = req.body;
  console.log(p);
  Conversation.find({ channel: p.channel }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata.length > 0) {
      slackuser.find({ user: p.user }, (err, userinfo) => {
        if (err) {
          return { err, ok: false };
        }

        Conversation.findByIdAndUpdate(
          userdata[0]._id,
          {
            lastinteraction: moment.now(),
            interactions: userdata[0].interactions + 1,
          },
          { new: true },
          (err, result) => {
            if (err) {
              return res.status(400).json({
                ok: false,
                err,
              });
            }

            let message = new Message({
              text: p.text,
              channel: p.channel,
              team: p.team,
              user: userinfo[0]._id,
              conversation: userdata[0]._id,
              created: moment.now(),
            });

            message.save(async (err, result) => {
              if (err) {
                res.status(400).json({
                  ok: false,
                  err,
                  message: " Falla en los parametros",
                });
              }

              return res.json({
                ok: true,
                result,
              });
            });
          }
        );
      });
    } else {
      return res.json({
        ok: false,
      });
    }
  });
});

module.exports = app;
