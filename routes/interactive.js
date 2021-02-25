const fetch = require("cross-fetch");
const express = require("express");
const app = express();

const enviar_mensaje = (webhook, mensaje) => {
  fetch(webhook, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mensaje),
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

const textoSlack = (xxx) => {
  return {
    text: xxx,
  };
};

const acepto = {
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "You have a new request:\n*<fakeLink.toEmployeeProfile.com|Fred Enriquez - New device request>*",
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: "*Type:*\nComputer (laptop)",
        },
        {
          type: "mrkdwn",
          text: "*When:*\nSubmitted Aut 10",
        },
        {
          type: "mrkdwn",
          text: "*Last Update:*\nMar 10, 2015 (3 years, 5 months)",
        },
        {
          type: "mrkdwn",
          text: "*Reason:*\nAll vowel keys aren't working.",
        },
        {
          type: "mrkdwn",
          text: '*Specs:*\n"Cheetah Pro 15" - Fast, really fast"',
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Approve",
          },
          style: "primary",
          value: "click_me_123",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Deny",
          },
          style: "danger",
          value: "click_me_123",
        },
      ],
    },
  ],
};

const selectChatorZoom = {
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "would you prefer chat or zoom?",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: ":capital_abcd: Chat",
            emoji: true,
          },
          value: "Chat",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: ":cinema: Zoom",
            emoji: true,
          },
          value: "Zoom",
        },
      ],
    },
  ],
};

app.post("/bot", (req, res) => {
  const resp = JSON.parse(req.body.payload);

  const value = resp.actions[0].value;
  console.log(value);
  console.log(resp.response_url);

  if (value === "1") {
    enviar_mensaje(resp.response_url, selectChatorZoom);
  }

  if (value === "3") {
    enviar_mensaje(resp.response_url, selectChatorZoom);
  }

  if (value === "5") {
    enviar_mensaje(resp.response_url, selectChatorZoom);
  }

  if (value === "Zoom") {
    enviar_mensaje(resp.response_url, textoSlack("Listo Muchas Gracias"));
  }

  if (value === "Chat") {
    enviar_mensaje(resp.response_url, textoSlack("Genial Muchas Gracias "));
  }

  res.json({
    ok: true,
  });
});

module.exports = app;
