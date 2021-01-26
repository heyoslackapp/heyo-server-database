const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verificarToken, isAdmin } = require("../middlewares/autenticacion");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendEmail20, registerUserEvent } = require("./common.js");
const _ = require("underscore");
const Usuario = require("../models/usuario");
const Conference = require("../models/conference");
const Question = require("../models/question");
const Invitation = require("../models/invitation");
var geoip = require("geoip-lite");
const requestIp = require("request-ip");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.post("/login", (req, res) => {
  let body = req.body;
  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: true,
        message: " (Usuario) o Password Incorrecto ",
      });
    }

    Conference.findOne({ _id: usuarioDB.conferenceId }).exec(
      (err, conferenceResult) => {
        if (err) {
          return res.status(400).json({
            ok: true,
            err,
            message: "Credenciales Incorrectas",
          });
        }

        if (!conferenceResult.active && usuarioDB.role === "USER") {
          res.json({
            message: "La conferencia no se encuentra activa",
            ok: true,
          });
          return false;
        }

        // Si no son iguales
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
          return res.status(400).json({
            ok: true,
            message: " Usuario o (Password) Incorrecto ",
          });
        }

        registerUserEvent({
          userId: usuarioDB._id,
          conferenceId: usuarioDB.conferenceId,
          type: "Login",
          description: "",
          surveyId: null,
          questionId: null,
        });

        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED_TOKEN, {
          expiresIn: process.env.EXPIRATION_DATE,
        });

        const clientIp = requestIp.getClientIp(req);
        var geo = geoip.lookup(clientIp);

        const body2 = {
          status: true,
          country: (geo && geo.country) || null,
          region: (geo && geo.region) || null,
          latitud: (geo && geo.ll[0]) || null,
          longitud: (geo && geo.ll[1]) || null,
          city: (geo && geo.city) || null,
        };

        Usuario.findByIdAndUpdate(
          usuarioDB._id,
          body2,
          { new: true },
          (err, results) => {}
        );

        global.socket.emit("user-update","1");

        res.json({
          token,
          user: usuarioDB,
          ok: true,
        });
      }
    );
  });
});

async function verify(token) {
  const ticket = await client
    .verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    .catch(console.error);
  const payload = ticket.getPayload();
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

app.post("/refreshToken", (req, res) => {
  let body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        message: " (Usuario) o Password Incorrecto ",
      });
    }

    // Si no son iguales
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        message: " Usuario o (Password) Incorrecto ",
      });
    }

    let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED_TOKEN, {
      expiresIn: process.env.EXPIRATION_DATE,
    });

    console.log(token);

    res.json({
      token,
      user: usuarioDB,
      ok: true,
    });
  });
});

app.post("/verify", verificarToken, (req, res) => {
  let parametro = req;
  res.json({
    user: parametro.usuario,
    ok: true,
  });
});

app.post("/email", verificarToken, (req, res) => {
  let body = req.body;
  const userId = req.usuario._id;
  const conferenceId = req.usuario.conferenceId;

  let question = new Question({
    userId,
    question: body.message,
    status: false,
    email: req.usuario.email,
    date: moment.now(),
    conferenceId,
    votos: 0,
  });

  question.save((err, questionDB) => {
    if (err) {
      res.status(400).json({
        ok: false,
        err,
        message: " Falla en los parametros",
      });
    }
    
    global.socket.emit("question-update","notification");

    registerUserEvent({
      userId,
      conferenceId,
      type: "Question",
      description: "",
      surveyId: null,
      questionId: questionDB._id,
    });


    res.json({
      ok: true,
      result: questionDB,
    });
  });
});

app.post("/ping", (req, res) => {
  let body = req.body;

  registerUserEvent({
    userId: body.userId,
    conferenceId: body.conferenceId,
    type: "Ping",
  });
});

app.post("/google", async (req, res) => {
  let token = req.body.idtoken;

  let googleUser = await verify(token).catch((e) => {
    return res.status(403).json({
      ok: false,
      message: "Error autenticandose de google",
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(500).json({
          message: "Debe usar la autenticacion Email/ Password",
        });
      } else {
        let token = jwt.sign(
          {
            usuario: usuarioDB,
          },
          process.env.SEED_TOKEN,
          { expiresIn: process.env.EXPIRATION_DATE }
        );

        return res.json({
          ok: true,
          usuario: usuarioDB,
          token,
        });
      }
    } else {
      //Si el usuario no existe

      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = "=)";

      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err,
          });
        }

        let token = jwt.sign(
          {
            usuario: usuarioDB,
          },
          process.env.SEED_TOKEN,
          { expiresIn: process.env.EXPIRATION_DATE }
        );

        return res.json({
          ok: true,
          usuario: usuarioDB,
          token,
        });
      });
    }
  });
});

app.post("/signin/:conferenceId", (req, res) => {
  let parametro = req.body;
  let conferenceId = req.params.conferenceId;
  let body = { status: true, email: parametro.email };
  const id = parametro.invitation;

  Invitation.findByIdAndUpdate(id, body, { new: true }, (err, results) => {
    //  const clientIp = requestIp.getClientIp(req);
    // var geo = geoip.lookup(clientIp);

    let usuario = new Usuario({
      nombre: parametro.name,
      email: parametro.email,
      password: bcrypt.hashSync(parametro.password, 10),
      role: "USER",
      conferenceId,
      status: false,
      invitation: true,
      date: moment.now(),
      /* country: null,
        region:  null,
        latitud: (geo && geo.ll[0]) || null,
        longitud: (geo && geo.ll[1]) || null,
        city: (geo && geo.city) || null,*/
    });

    usuario.save((err, usuarioDB) => {
      if (err) {
        res.status(400).json({
          ok: false,
          err,
          message: " Falla en los parametros",
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDB,
      });
      
    });
  });
});

module.exports = app;
