const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verificarToken } = require("../middlewares/autenticacion");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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


        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED_TOKEN, {
          expiresIn: process.env.EXPIRATION_DATE,
        });


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


module.exports = app;
