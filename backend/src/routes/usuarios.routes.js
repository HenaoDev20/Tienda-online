const express = require("express");

const router = express.Router();

const {
    crearUsuario,
    iniciarSesion
} = require("../controllers/usuarios.controller");

const verificarToken = require("../middleware/auth.middleware");


router.post("/", crearUsuario);

router.post("/login", iniciarSesion);

router.get("/perfil", verificarToken, (req, res) => {

    console.log("Usuario obtenido del token:", req.usuario);

    res.json({
        mensaje: "Acceso autorizado",
        usuario: req.usuario
    });

});


module.exports = router;