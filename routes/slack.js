const express = require("express");
const app = express();

moment = require("moment");

const { WebClient } = require("@slack/web-api");
const token =
  "xoxp-224498606455-233668675862-1749324479827-8f6f4e4cb1b6c2cc328bfa957109484d";
const web = new WebClient(token);

const Root = require("../models/root");
const Slackuser = require("../models/slackuser");

const users = Object.freeze({
  STATE: {
    disabled: "0",
    onhold: "1",
    connected: "2",
  },
  MODE: {
    chat: "chat",
    zoom: "zoom",
  },
});

app.post("/slackUserLoadGrid", (req, res) => {
  let parametro = req.body;

  Root.findOne({ _id: parametro.rootId }).exec((err, rootInfo) => {
    let page = parametro.page || 0;
    page = Number(page);

    let rows = parametro.rows || 0;
    rows = Number(rows);

    const AscOrDesc = parametro.sord === "asc" ? 1 : -1;

    let busqueda = { archived: null };

    Slackuser.find(busqueda)
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

app.get("/test", (req, res) => {
  res.json({
    ok: true,
    ambiente: "tesssst",
  });
});

app.post("/registeruser", (req, res) => {
  const { user, channel, team } = req.body;
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      console.log(err);
      return { err, ok: false };
    }

    if (userdata) {
      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { state: users.STATE.onhold } },
        { new: true },
        (err, result) => {
          if (err) {
            console.log(err);
            return err;
          }
          console.log(result);
          return res.json({
            ok: true,
            result,
          });
        }
      );
    } else {
      let slackuser = new Slackuser({
        user,
        channel,
        team,
        state: users.STATE.onhold,
      });

      slackuser.save((err, result) => {
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
  });
});

app.post("/userInactive", (req, res) => {
  const { user } = req.body;
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata) {
      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { state: users.STATE.disabled } },
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

app.post("/userBusy", (req, res) => {
  const { user } = req.body;
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata && userdata.connections > 0) {
      //let datelimit = moment().add(4, "days");
      let connections = parseInt(userdata.connections) - 1;

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

app.post("/saveQuestion01", (req, res) => {
  const { user, answer } = req.body;
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata) {
      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { people: answer, connections: answer } },
        { new: true },
        async (err, result) => {
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

app.post("/saveUserInfo", (req, res) => {
  const { user, username, avatar, title } = req.body;
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata) {
      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { title, username, avatar } },
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

app.post("/saveQuestion02", (req, res) => {
  const { user, answer } = req.body;
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata) {
      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { mode: answer } },
        { new: true },
        (err, result) => {
          if (err) return err;

          heyoGrou({ user, mode: answer, res }).then((resultado) => {
            if (resultado) {
              res.json({
                ok: true,
                userx: resultado,
                usery: user,
              });
            } else {
              res.json({
                ok: false,
                userx: null,
                usery: null,
              });
            }
          });
        }
      );
    } else {
      res.json({
        ok: false,
        userdata,
        userx: null,
        usery: null,
      });
    }
  });
});

app.post("/finduser", (req, res) => {
  const { user } = req.body;
  finduser({ user }).then((result) => {
    res.json({
      ok: true,
      result,
    });
  });
});

app.post("/findUserByMode", (req, res) => {
  const { user, mode } = req.body;
  findUserByMode({ user, mode }).then((result) => {
    res.json({
      ok: true,
      result,
    });
  });
});

app.post("/createSlackConvesation", async (req, res) => {
  try {
    const result = await web.conversations.create({
      name: "test0034",
    });
    res.json({
      ok: false,
      error,
    });
    // The result will include information like the ID of the conversation
    console.log(result);
  } catch (error) {
    res.json({
      ok: false,
      error,
    });
  }
});

app.post("/createHeyoChannel", async (req, res) => {
  try {
    // Call the conversations.list method using the WebClient
    const result = await web.conversations.list({
      exclude_archived: true,
      types: "public_channel,private_channel,im,mpim",
      limit: 1000,
    });

    result.channels.forEach(function (conversation) {
      console.log(conversation["name"]);
      if (conversation["name"] === "heyo-app") {
        console.log("SI existo");
        return res.json({
          ok: true,
          result: conversation,
        });
      }
    });

    const result2 = await web.conversations.create({
      name: "heyo-app",
      is_private: false,
    });

    return res.json({
      ok: true,
      result: result2,
    });

    //saveConversations(result.channels);
  } catch (error) {
    console.error(error);
    return res.json({
      ok: true,
      error,
    });
  }
});

app.post("/validateChannel", async (req, res) => {
  const { channelId } = req.body;

  try {
    // Call the conversations.list method using the WebClient
    const result = await web.conversations.list({
      exclude_archived: true,
      types: "public_channel,private_channel,im,mpim",
      limit: 1000,
    });

    let resultado = false;

    result.channels.forEach(function (conversation) {
      if (
        conversation["id"] === channelId &&
        conversation["name"] === "heyo-app"
      ) {
        resultado = true;
        return res.json({
          ok: true,
        });
      }
    });

    if (resultado === false) {
      return res.json({
        ok: false,
      });
    }

    //saveConversations(result.channels);
  } catch (error) {
    console.error(error);
    return res.json({
      ok: false,
    });
  }
});

app.post("/inviteSlackConvesation", async (req, res) => {
  const { channel, users } = req.body;

  try {
    const result = await web.conversations.invite({
      channel,
      users,
    });

    res.json({
      ok: false,
      error,
    });
    console.log(result);
  } catch (error) {
    res.json({
      ok: false,
      error,
    });
  }
});

const findUserByMode = async ({ user, mode }) => {
  console.log(
    " buscare un usuario para crear una conversacion",
    user,
    "modo:",
    mode
  );
  return await Slackuser.find(
    { mode, state: "1", user: { $ne: user } },
    (err, result) => {
      if (err) return err;
      return result;
    }
  );
};

const heyoGrou = async ({ user, mode = "chat", res }) => {
  const users = await findUserByMode({ user, mode });
  if (users[0]) {
    return users[0].user;
  } else {
    return null;
  }
};

module.exports = app;
