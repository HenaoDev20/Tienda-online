const express = require("express");

const router = express.Router();


const {
    crearPedido,
    obtenerMisPedidos,
    obtenerPedidoPorId
} = require("../controllers/pedidos.controller");


const verificarToken =
    require("../middleware/auth.middleware");


// =========================
// CREAR PEDIDO
// =========================

router.post(
    "/",
    verificarToken,
    crearPedido
);

// OBTENER MIS PEDIDOS
router.get(
    "/mis-pedidos",
    verificarToken,
    obtenerMisPedidos
);

// OBTENER PEDIDO POR ID
router.get(
    "/:id",
    verificarToken,
    obtenerPedidoPorId
);


module.exports = router;