const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const _ = require("underscore");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
var moment = require("moment-timezone");

const Answer = require("../models/answer");
const Survey = require("../models/survey");
const Question = require("../models/question");
const Voto = require("../models/voto");
const UserEvent = require("../models/userEvent");
const Usuario = require("../models/usuario");

app.get("/answer/", verificarToken, (req, res) => {
  Answer.find({ conferenceId: req.usuario.conferenceId })
    .populate("Surveys", "question")
    .exec((err, answers) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Answer.find({ conferenceId: req.usuario.conferenceId }).exec(
        (err, answers) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              err,
            });
          }
        }
      );

      Survey.find({ id: answers.surveyId }).exec((err, surveyDB) => {
        Answer.count(
          { conferenceId: req.usuario.conferenceId },
          (err, conteo) => {
            res.json({
              ok: true,
              total: conteo,
              answers,
              survey: surveyDB,
            });
          }
        );
      });
    });
});

app.get("/answerBySurvey/:survey", verificarToken, (req, res) => {
  let conferenceId = req.usuario.conferenceId;
  let surveyId = req.params.survey;

  Answer.find({ conferenceId, surveyId }).exec((err, answers) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    Survey.find({ id: surveyId }).exec((err, surveyDB) => {
      Answer.count({ conferenceId, surveyId }, (err, conteo) => {
        res.json({
          ok: true,
          total: conteo,
          answers,
          survey: surveyDB,
        });
      });
    });
  });
});

app.get("/answerExcel/:id", verificarToken, (req, res) => {
  let conferenceId = req.params.id;
  Answer.find({ conferenceId }).exec((err, answers) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.set("Content-Type", "application/octet-stream");
    res.send(answers);
  });
});

//Recibe parametro de conferencia
app.get("/answerSurveyIds/:id", verificarToken, (req, res) => {
  let surveyId = req.params.id;

  Answer.find({ surveyId })
    .populate("userId")
    .exec((err2, answers2) => {
      if (err2) {
        return res.status(400).json({
          ok: false,
          err2,
        });
      }

      const answerR = {};
      let label = [];

      answers2.forEach(function (item2) {
        answerR[item2.answer] = (answerR[item2.answer] || 0) + 1;
        label.push(item2.answer);
      });

      Survey.find({ id: answers2.surveyId }).exec((err, surveyDB) => {
        res.json({
          ok: true,
          label,
          answerR,
          user: answers2[0].userId,
          survey: surveyDB,
        });
      });
    });
});

// Respuesta de la encuesta
app.post("/answer/:id", verificarToken, (req, res) => {
  let surveyId = req.params.id;
  let parametro = req.body;
  const conferenceId = req.usuario.conferenceId;
  const userId = req.usuario._id;

  let answer = new Answer({
    userId,
    date: moment.now(),
    answer: parametro.answer,
    status: true,
    surveyId,
    conferenceId,
  });

  answer.save((err, answerDB) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    registerUserEvent({
      userId: parametro.user,
      conferenceId: parametro.conferenceId,
      type: "Answer",
      description: parametro.answer,
      surveyId,
      questionId: null,
    });

    global.socket.emit("survey-update", true);

    res.json({
      ok: true,
      answer: answerDB,
    });
  });
});

app.get("/question/", verificarToken, (req, res) => {
  let conferenceId = req.usuario.conferenceId;

  Question.find({ conferenceId })
    .sort([["votos", -1]])
    .populate("userId")
    .exec((err, questions) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      const status = {};
      questions.forEach(function (item) {
        status[item.status] = (status[item.status] || 0) + 1;
      });

      Question.count({ conferenceId }, (err, conteo) => {
        res.json({
          ok: true,
          total: conteo,
          questions,
          status,
        });
      });
    });
});

app.put("/questionVote/:questionId", verificarToken, (req, res) => {
  const questionId = req.params.questionId;
  const conferenceId = req.usuario.conferenceId;
  const userId = req.usuario._id;

  let parametro = req.body;

  let voto = new Voto({
    questionId,
    status: true,
    conferenceId,
    date: moment.now(),
    userId,
  });

  global.socket.emit("question-update", "1");

  Voto.count({ questionId, userId }).exec((err, votoDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    if (votoDB > 0) {
      res.json({
        ok: true,
        votoDB,
      });
    } else {
      voto.save((err, votoDB2) => {
        if (err) {
          res.status(400).json({
            ok: false,
            err,
            message: " Falla en los parametros",
          });
        }

        registerUserEvent({
          userId,
          conferenceId,
          type: "Like",
          description: "",
          surveyId: null,
          questionId,
        });

        Voto.count({ questionId }).exec((err, votoDB) => {
          if (err) {
            return res.status(400).json({
              ok: false,
              err,
            });
          }

          const final = Number(votoDB);
          Question.findByIdAndUpdate(
            { _id: questionId },
            { votos: final },
            { new: true },
            (err, questionDB2) => {
              if (err) {
                return res.status(400).json({
                  ok: false,
                  err,
                });
              }

              global.socket.emit("question-update", "1");

              res.json({
                ok: true,
                survey: questionDB2,
              });
            }
          );
        });
      });
    }
  });
});

app.get("/verifyVote", verificarToken, (req, res) => {
  let userId = req.usuario._id;
  let conferenceId = req.usuario.conferenceId;

  Voto.find({ userId, conferenceId }).exec((err, resultDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      resultDB,
    });
  });
});

app.get("/usuarix", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  Usuario.find({ conferenceId }).exec((err, usuarios) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    Usuario.countDocuments({ conferenceId }, (err, conteo) => {
      res.json({
        ok: true,
        total: conteo,
        usuarios,
      });
    });
  });
});

app.get("/usuarixActive", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  Usuario.find({ conferenceId, status: true, role: "USER" }).exec(
    (err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Usuario.countDocuments(
        { conferenceId, status: true, role: "USER" },
        (err, conteo) => {
          res.json({
            ok: true,
            total: conteo,
            usuarios,
          });
        }
      );
    }
  );
});

app.post("/usuarixCount/", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  let parametro = req.body;
  const start = parametro.start;
  const end = parametro.end;
  UserEvent.countDocuments(
    { conferenceId, date: { $gte: start, $lt: end } },
    (err, conteo) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        total: conteo,
      });
    }
  );
});

app.get("/questionLike/:questionId", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  let questionId = req.params.questionId;

  UserEvent.find({ conferenceId, type: "Like", questionId })
    .populate("questionId")
    .populate("userId")
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      const results = usuarios.map((item) => {
        return {
          nombre: item.userId.nombre,
          email: item.userId.email,
          description: item.userId.description,
          question: item.questionId.question,
        };
      });

      res.json({
        ok: true,
        usuarios: results,
      });
    });
});

app.put("/questionStatus/:id", (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["status"]);

  Question.findByIdAndUpdate(id, body, { new: true }, (err, results) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    global.socket.emit("question-update", "1");

    res.json({
      ok: true,
      results,
    });
  });
});

app.get("/usuarioTotalx", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  Usuario.find({ conferenceId, role: "USER", status: true }).exec(
    (err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      const users = {};
      usuarios.forEach(function (item) {
        users[item.status] = (users[item.status] || 0) + 1;
      });

      const invitations = {};
      usuarios.forEach(function (item) {
        invitations[item.invitation] = (invitations[item.invitation] || 0) + 1;
      });

      const country = {};
      usuarios.forEach(function (item) {
        country[item.country] = (country[item.country] || 0) + 1;
      });

      const region = {};
      usuarios.forEach(function (item) {
        region[item.region] = (region[item.region] || 0) + 1;
      });

      const city = {};
      usuarios.forEach(function (item) {
        city[item.city] = (city[item.city] || 0) + 1;
      });

      res.json({
        ok: true,
        users,
        invitations,
        country,
        region,
        city,
      });
    }
  );
});

app.get("/questionTotal", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  Question.find({ conferenceId }).exec((err, results) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    const status = {};
    results.forEach(function (item) {
      status[item.status] = (status[item.status] || 0) + 1;
    });

    res.json({
      ok: true,
      status,
    });
  });
});

app.get("/usuarioActive/", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;

  var date = moment().subtract(10, "minutes");
  var minute = date.minutes();
  const xxx = date.subtract(minute, "minutes").format("YYYY-MM-DDTHH:mm");

  UserEvent.find({ conferenceId, date: { $gt: xxx } })
    .populate("userId")
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        usuarios,
      });
    });
});

app.put("/usuarioFlag/", verificarToken, (req, res) => {
  let body = _.pick(req.body, ["flag"]);

  Usuario.findByIdAndUpdate(
    req.usuario._id,
    body,
    { new: true },
    (err, usuarioDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDB,
      });
    }
  );
});

function registerUserEvent(props) {
  let userEvent = new UserEvent({
    userId: props.userId,
    conferenceId: props.conferenceId,
    type: props.type,
    description: props.description,
    questionId: props.questionId,
    surveyId: props.surveyId,
    date: moment.now(),
  });

  userEvent.save((err, userEventDB) => console.log(err));
}

module.exports = app;
