const express = require("express");

const router = express.Router();

const {
    crearUsuario,
    iniciarSesion,
    obtenerClientes
} = require("../controllers/usuarios.controller");

const verificarToken = require("../middleware/auth.middleware");

const verificarAdmin = require("../middleware/role.middleware");
                       

// Crear usuario
router.post("/", crearUsuario);

// Iniciar sesión
router.post("/login", iniciarSesion);

// Obtener perfil
router.get("/perfil", verificarToken, (req, res) => {

    console.log("Usuario obtenido del token:", req.usuario);

    res.json({
        mensaje: "Acceso autorizado",
        usuario: req.usuario
    });

});

// Obtener clientes
router.get(
    "/clientes",
    verificarToken,
    verificarAdmin,
    obtenerClientes
);


module.exports = router;