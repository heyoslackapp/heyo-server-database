const { customAlphabet } = require("nanoid");

const fetch = require("cross-fetch");
const Root = require("../models/root");

var SlackBot = require("slackbots");
const express = require("express");

const app = express();
const fs = require("fs");
moment = require("moment");
const { v4: uuidv4 } = require("uuid");

const { WebClient } = require("@slack/web-api");
const token =
  "xoxp-224498606455-233668675862-1749324479827-8f6f4e4cb1b6c2cc328bfa957109484d";
const web = new WebClient(token);

const nanoid = customAlphabet("1234567890abcdef", 5);
var bot = new SlackBot({
  token: "xoxb-224498606455-1725881949639-wkGAEFq8gWnbr2JPrl3KLzLQ",
  name: "heyo",
});

const Slackuser = require("../models/slackuser");

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
  console.log(req.body);
  res.json({
    ok: true,
  });
});

app.post("/registeruser", (req, res) => {
  //console.log("register user");
  const { user, channel, team } = req.body;
  //console.log(channel);
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata) {
      console.log("Se ha registrado de nuevo un usuario");
      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { state: "1" } },
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
      // sconsole.log("Se ha registrado un NUEVO usuario");

      let slackuser = new Slackuser({
        user,
        channel,
        team,
        state: "1",
        //username: result.name,
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
  // console.log("Voy a intentar desactivar un usuario");
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata) {
      // console.log("Se desactivar un usuario");

      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { state: "0" } },
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
      let datelimit = moment().add(4, "days");
      let connections = parseInt(userdata.connections) - 1;

      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { state: "2", datelimit, connections } },
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
  console.log("Guardando pregunta 01");
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata) {
      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { people: answer, connections: answer } },
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

app.post("/saveUserInfo", (req, res) => {
  const { user, username, avatar, title } = req.body;
  console.log("Guardando info extra del user");
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
  console.log("Guardando pregunta 02");
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
    console.log(result);
    res.json({
      ok: true,
      result,
    });
  });
});

app.post("/findUserByMode", (req, res) => {
  const { user, mode } = req.body;
  console.log(uuidv4());
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
  console.log("Creando conversacion");
  const users = await findUserByMode({ user, mode });
  if (users[0]) {
    return users[0].user;
  } else {
    return null;
  }
};

const createConversation = async () => {
  let ramdomName = nanoid();
  console.log("canal creado", `heyo-${ramdomName}`);
  return await web.conversations.create({
    name: `heyo-${ramdomName}`,
  });
};

const inviteUsersConversation = async ({ channel, user }) => {
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }

    if (userdata) {
      // console.log("Se desactivar un usuario");

      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { state: "2" } },
        { new: true },
        (err, result) => {
          if (err) return err;

          web.conversations.invite({
            channel,
            users: user,
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
};

const updateStatusUser = ({ user, state }) => {
  Slackuser.findOne({ user }, (err, userdata) => {
    if (err) {
      return { err, ok: false };
    }
    if (userdata) {
      Slackuser.findByIdAndUpdate(
        userdata._id,
        { $set: { state } },
        { new: true },
        (err, result) => {
          if (err) return err;
        }
      );
    }
  });
};

module.exports = app;

// const { App } = require("@slack/bolt");

/*
const Slackuser = require("../models/slackuser");
const Slackchannel = require("../models/slackchannel");

// let conversationsStore = {};

async function populateConversationStore(conversationIdChannel) {
  try {
    const result = await web.conversations.list({
      types: "private_channel",
      limit: 200,
    });
    let channelName = "";
    result.channels.forEach(function (conversation) {
      if (conversationIdChannel === conversation.id) {
        channelName = conversation.name;
      }
    });
    return channelName;
  } catch (error) {
    console.error(error);
  }
}

const webhook =
  "https://hooks.slack.com/services/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";
const mensaje = {
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":mag: Search results for *Cata*",
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*<fakeLink.toYourApp.com|facebook>*. Enviar solicitudes a facebook desde mi app",
      },
      accessory: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          emoji: true,
          text: "acepta?",
        },
        options: [
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Si",
            },
            value: "11",
          },
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "No",
            },
            value: "22",
          },
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Tal vez",
            },
            value: "33",
          },
        ],
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*<fakeLink.toYourApp.com|Customer Support - Workflow Diagram Catalogue>*\nThis resource was put together by members of...",
      },
      accessory: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          emoji: true,
          text: "Manage",
        },
        options: [
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Manage it",
            },
            value: "value-0",
          },
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Read it",
            },
            value: "value-1",
          },
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Save it",
            },
            value: "value-2",
          },
        ],
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*<fakeLink.toYourApp.com|Self-Serve Learning Options Catalogue>*\nSee the learning and development options we...",
      },
      accessory: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          emoji: true,
          text: "Manage",
        },
        options: [
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Manage it",
            },
            value: "value-0",
          },
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Read it",
            },
            value: "value-1",
          },
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Save it",
            },
            value: "value-2",
          },
        ],
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*<fakeLink.toYourApp.com|Use Case Catalogue - CF Presentation - [June 12, 2018]>*\nThis is presentation will continue to be updated as...",
      },
      accessory: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          emoji: true,
          text: "Manage",
        },
        options: [
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Manage it",
            },
            value: "value-0",
          },
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Read it",
            },
            value: "value-1",
          },
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Save it",
            },
            value: "value-2",
          },
        ],
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*<fakeLink.toYourApp.com|Comprehensive Benefits Catalogue - 2019>*\nInformation about all the benfits we offer is...",
      },
      accessory: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          emoji: true,
          text: "Manage",
        },
        options: [
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Manage it",
            },
            value: "value-0",
          },
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Read it",
            },
            value: "value-1",
          },
          {
            text: {
              type: "plain_text",
              emoji: true,
              text: "Save it",
            },
            value: "value-2",
          },
        ],
      },
    },
    {
      type: "divider",
    },
  ],
};

const selectConversationMode = {
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "How many people do you want to meet each week?",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "1",
            emoji: true,
          },
          value: "1",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "3",
            emoji: true,
          },
          value: "3",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "5",
            emoji: true,
          },
          value: "5",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "10",
            emoji: true,
          },
          value: "10",
        },
      ],
    },
  ],
};

const enviar_mensaje = () => {
  fetch(webhook, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(selectConversationMode),
  })
    .then(function (response) {
      console.log("response =", response);
      return response.json();
    })
    .then(function (data) {
      console.log("data = ", data);
    })
    .catch(function (err) {
      console.log("te llafe");
    });
};
*/

//greetingsConverationByBot({ channel: "C01MRDVJGCV" });

// bot.postMessageToChannel({ channel: "C01MRDVJGCV", text: "hello" });

// heyoGrou({ user: "U01NQTJK2Q0", mode: "video" });

/*
bot.on("message", async function (data) {
  console.log("volvi por aqui");

  if (!data.text || data.type !== "message" || data.subtype == "bot_message")
    return;

  const channel = await populateConversationStore(data.channel);

  if (data.channel) {
    try {
      bot.postMessageToChannel(channel, "pedro");
    } catch (error) {
      console.log("error 222");
    }
    enviar_mensaje();
  }

  if (data.text === "mijooo") {
    // bot.postMessageToChannel(conversationsStore[data.channel].name, 'hagale sin miedooooooo!');
  }
});

app.post("/adduser", (req, res) => {
  const params = req.body;
  fs.writeFile("slack.txt", "Hello world!", function (err) {
    // If an error occurred, show it and return
    if (err) return console.error(err);
    // Successfully wrote to the file!
  });

  const {
    user_name,
    user_id,
    team_id,
    team_domain,
    channel_id,
    channel_name,
    text,
    response_url,
  } = params;

  let slackuser = new Slackuser({
    user_name,
    user_id,
    team_id,
    team_domain,
    channel_id,
    channel_name,
    text,
    response_url,
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
});

app.post("/addconversation", (req, res) => {
  const params = req.body;
  if (params.text) {
    (async () => {
      // const res = await web.chat.postMessage({ channel: conversationId, text: 'Hello there' });

      let procesado = params.text.replace(/\s+/g, ""); // > "Textodeejemplo"

      const result1 = await web.conversations.create({
        name: String(procesado),
      });

      let slackchannel = new Slackchannel({
        name: params.text.trim(),
      });

      slackchannel.save((err, result) => {
        if (err) {
          res.status(400).json({
            ok: false,
            err,
            message: " Falla en los parametros",
          });
        }

        res.json({
          ok: true,
          id: result1.id,
        });
      });
    })();
  }
});

app.post("/play", (req, res) => {
  Slackuser.find().exec((err, result) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    var listado = [1, 2, 3, 4];
    const Total = listado.length;
    var aleatorio = "";
    var seleccion = "";
    var newArray = [];
    const limit = 3;

    for (i = 0; i <= Total; i++) {
      aleatorio = Math.floor(Math.random() * listado.length);
      seleccion = listado[aleatorio];
      listado.splice(aleatorio, 1);
      newArray.push(seleccion);
      if (limit <= i + 1) {
        break;
      }
    }

    let userArray = [];

    newArray.map((item) => {
      userArray.push(result[parseInt(item)].user_id);
    });

    const users__ = userArray.join(",");

    if (result) {
      (async () => {
        // const res = await web.chat.postMessage({ channel: conversationId, text: 'Hello there' });

        const result = await web.conversations.invite({
          channel: "C01LGSBEH8R",
          users: users__,
        });

        res.json({
          ok: true,
          result,
        });
      })();

      res.json({
        ok: true,
      });
    }
  });
});

app.post("/conversationTypeSelected", (req, res) => {
  console.log(req.body);
  res.json({
    ok: true,
  });
});

*/
