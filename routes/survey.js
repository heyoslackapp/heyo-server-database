const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const _ = require("underscore");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");

const Survey = require("../models/survey");
const Answer = require("../models/answer");

app.get("/survey", verificarToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 0;
  limite = Number(limite);

  Survey.find({ conferenceId: req.usuario.conferenceId })
    .skip(desde)
    .limit(limite)
    .exec((err, surveys) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      const status = {};
      surveys.forEach(function (item) {
        status[item.status] = (status[item.status] || 0) + 1;
      });

      Survey.count({ conferenceId: "1" }, (err, conteo) => {
        res.json({
          ok: true,
          total: conteo,
          surveys,
          status,
        });
      });
    });
});

app.get("/surveyUser", verificarToken, (req, res) => {
  Survey.find({ conferenceId: req.usuario.conferenceId, status: true }).exec(
    (err, surveys) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        surveys,
      });
    }
  );
});

app.post("/survey", (req, res) => {
  let parametro = req.body;
  let survey = new Survey({
    user: parametro.userId,
    question: parametro.question,
    type: parametro.type,
    options: parametro.options,
    status: parametro.status,
    date: moment.now(),
    email: parametro.email,
    conferenceId: parametro.conferenceId,
    language:parametro.language
  });

  survey.save((err, surveyDB) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    global.socket.emit("survey-update",true);

    res.json({
      ok: true,
      survey: surveyDB,
    });
  });
});

app.put("/survey/:id", (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["status"]);

  Survey.findByIdAndUpdate(id, body, { new: true }, (err, surveyDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    global.socket.emit("survey-update",true);

    res.json({
      ok: true,
      survey: surveyDB,
    });
  });
});

app.delete("/survey/:id", [verificarToken, isAdmin], (req, res) => {
  let id = req.params.id;

  Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }

    if (!usuarioBorrado) {
      res.status(400).json({
        ok: false,
        err,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      data: id,
    });
  });
});

app.get("/surveyTotal", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  Survey.find({ conferenceId }).exec((err, results) => {
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

app.get("/verifyUsers", verificarToken, (req, res) => {
  const conferenceId = req.usuario.conferenceId;
  Usuario.find({ conferenceId }).exec((err, results) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
  });
});

app.get("/surveyWithAnswersByUser", verificarToken, (req, res) => {
  Answer.find({
    conferenceId: req.usuario.conferenceId,
    userId: req.usuario._id,
  })
    .populate("Surveys", "question")
    .exec((err, answers) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      let included = [];
      answers.map((item) => {
        included.push(item.surveyId);
      });

      Survey.find({
        conferenceId: req.usuario.conferenceId,
        _id: { $in: included },
      }).exec((err, surveys) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        const status = {};
        surveys.forEach(function (item) {
          status[item.status] = (status[item.status] || 0) + 1;
        });

        res.json({
          ok: true,
          surveys,
          status,
        });
      });
    });
});

app.post("/surveyWithoutAnwersByUser", verificarToken, (req, res) => {
  Answer.find({
    conferenceId: req.usuario.conferenceId,
    userId: req.usuario._id,
  }).exec((err, answers) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    let excluded = [];
    answers.map((item) => {
      excluded.push(item.surveyId);
    });

    Survey.find({
      conferenceId: req.usuario.conferenceId,
      _id: { $nin: excluded },
    }).exec((err, surveys) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      const status = {};
      surveys.forEach(function (item) {
        status[item.status] = (status[item.status] || 0) + 1;
      });

      //global.socket.emit("survey-update",true);
      
      Survey.count({ conferenceId: "1" }, (err, conteo) => {
        res.json({
          ok: true,
          total: conteo,
          surveys,
          status,
        });
      });
    });
  });
});

module.exports = app;
