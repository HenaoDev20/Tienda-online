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
const verificarAdmin = require("../middleware/role.middleware");

router.get("/", verificarToken, obtenerProductos);

router.get("/:id", verificarToken, obtenerProductoPorId);

// Rutas protegidas para crear, actualizar y eliminar productos
router.post("/", verificarToken, verificarAdmin, crearProducto);

router.put("/:id", verificarToken,verificarAdmin, actualizarProducto);

router.delete("/:id", verificarToken, verificarAdmin, eliminarProducto);

module.exports = router;