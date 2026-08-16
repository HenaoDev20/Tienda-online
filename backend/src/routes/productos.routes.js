const express = require("express");

const router = express.Router();

const {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require("../controllers/productos.controller");

const verificarToken = require("../middleware/auth.middleware");

router.get("/", verificarToken, obtenerProductos);

router.get("/:id", verificarToken, obtenerProductoPorId);

router.post("/", verificarToken, crearProducto);

router.put("/:id", verificarToken, actualizarProducto);

router.delete("/:id", verificarToken, eliminarProducto);

module.exports = router;