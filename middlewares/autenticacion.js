const jwt = require("jsonwebtoken");
const { json } = require("body-parser");

let verificarToken = (req, res, next) => {
  let token = req.get("Authorization");
  jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err,
      });
    }

    req.usuario = decoded.usuario;
    next();
  });
};

let isAdmin = (req, res, next) => {
  if (req.usuario.role === "ADMIN_ROLES") {
    next();
  } else {
    return res.json({
      ok: false,
      message: "Este Usuario NO es administrador",
    });
  }
};

module.exports = {
  verificarToken,
  isAdmin,
};
