const express = require("express");

const router = express.Router();

const {
    obtenerProductos,
    crearProducto
} = require("../controllers/productos.controller");

const verificarToken = require("../middleware/auth.middleware");

router.get("/", verificarToken, obtenerProductos);

router.post("/", verificarToken, crearProducto);

module.exports = router;