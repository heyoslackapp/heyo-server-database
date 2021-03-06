const express = require("express");
const app = express();
const axios = require("axios");

moment = require("moment");
const { WebClient } = require("@slack/web-api");
const { globals, slackConsole } = require("../middlewares/settings");
const web = new WebClient(globals.TOKEN.slack_xoxp);
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
  let userx = "U6VKNKVRC";
  let usery = "U6TMF4D6J";
  let userz = "U01KT6PK1K8";

  web.conversations
    .open({
      users: `${userx},${usery},${userz}`,
      return_im: false,
    })
    .then((result) => {
      web.chat.postMessage({
        channel: result.channel.id,
        text: `Welcome to Heyo 3 :wave: <@${userx}>  <@${usery}>`,
      });

      res.json({
        ok: true,
        ambiente: "tesssst",
        result,
      });
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

app.post("/userBusy", (req, res) => {
  const { user, bot } = req.body;
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata && userdata.connections > 0) {
      let datelimit = moment.now();

      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { state: users.STATE.connected, datelimit, bot } },
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

/* IMPORTANTS */

//Esta funcion se llama siempre que un usuario se une al grupo
app.post("/registeruser", (req, res) => {
  const { user, channel, team, avatar, title, username } = req.body;

  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      slackConsole(err);
      return { err, ok: false };
    }

    if (userdata) {
      slackConsole("El usuario se encuentra ya registrado");
      Slackuser.findByIdAndUpdate(
        userdata._id,
        {
          $set: {
            state: users.STATE.onhold,
            people: 1,
            connections: 1,
            datelimit: moment().subtract(4, "day"),
          },
        },
        { new: true },
        (err, result) => {
          if (err) {
            slackConsole("Error actualizando el usuario");
            slackConsole(err);
            return err;
          }

          slackConsole("Usuario actualizado con exito");
          return res.json({
            ok: true,
            result,
          });
        }
      );
    } else {
      slackConsole("Se registrara el usuario");
      let slackuser = new Slackuser({
        user,
        channel,
        team,
        avatar,
        title,
        username,
        state: users.STATE.onhold,
        mode: "chat",
        people: 0,
        connections: 0,
        datelimit: moment().subtract(4, "day"),
      });

      slackuser.save((err, result) => {
        if (err) {
          slackConsole("Error Registrando el Usuario.");
          slackConsole(err);
          res.status(400).json({
            ok: false,
            err,
            message: " Falla en los parametros",
          });
        }

        slackConsole("Usuario Registrado con exito!.");
        res.json({
          ok: true,
          result,
        });
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

    console.log(userdata);
    if (userdata.people > 0) {
      Slackuser.findOneAndUpdate(
        { user },
        {
          $set: {
            people: answer,
          },
        },
        { new: true },
        async (err, userdata) => {
          if (err) {
            slackConsole("Error el usuario no se encontro en la base de dato");
            return { err, ok: false };
          }

          return res.json({
            ok: true,
            isNew: false,
            userdata,
          });
        }
      );
    } else {
      Slackuser.findOneAndUpdate(
        { user },
        {
          $set: {
            people: answer,
            connections: answer,
            datelimit: moment().subtract(4, "day"),
          },
        },
        { new: true },
        async (err, userdata) => {
          if (err) {
            slackConsole("Error el usuario no se encontro en la base de dato");
            return { err, ok: false };
          }

          return res.json({
            ok: true,
            isNew: true,
            userdata,
          });
        }
      );
    }
  });
});

app.get("/slack/authorization", (req, res) => {
  console.log(req);

  return res.json({
    ok: true,
    msg: "todo ok",
    req,
  });
});

app.post("/userInactive", (req, res) => {
  const { user } = req.body;
  slackConsole("Se buscara desactivar un usuario");
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      slackConsole("Error el usuario no existe");
      return { err, ok: false };
    }

    if (userdata) {
      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { state: users.STATE.disabled } },
        { new: true },
        (err, result) => {
          if (err) return err;
          slackConsole("El usuario fue desactivado EXITOSAMENTE!!");
          return res.json({
            ok: true,
            result,
          });
        }
      );
    } else {
      slackConsole("Error Dedactivando el usuario");
      res.json({
        ok: false,
        userdata,
      });
    }
  });
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
    // ok
    if (resultado === false) {
      return res.json({
        ok: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      ok: false,
    });
  }
});

module.exports = app;
