const express = require("express");

const router = express.Router();

const {
    crearUsuario,
    iniciarSesion
} = require("../controllers/usuarios.controller");

router.post("/", crearUsuario);
router.post("/login", iniciarSesion);

module.exports = router;