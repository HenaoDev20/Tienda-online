const express = require("express");

const router = express.Router();


const {
    crearPedido,
    obtenerMisPedidos,
    obtenerPedidoPorId,
    obtenerTodosLosPedidos,
    actualizarEstadoPedido
} = require("../controllers/pedidos.controller");


const verificarToken =
    require("../middleware/auth.middleware");

const verificarAdmin =
    require("../middleware/role.middleware");


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

// =========================
// OBTENER TODOS LOS PEDIDOS
// SOLO ADMINISTRADOR
// =========================

router.get(
    "/admin/todos",
    verificarToken,
    verificarAdmin,
    obtenerTodosLosPedidos
);

//=========================
// ACTUALIZAR ESTADO
// ADMINISTRADOR
// =========================

router.patch(
    "/admin/:id/estado",
    verificarToken,
    verificarAdmin,
    actualizarEstadoPedido
);


// OBTENER PEDIDO POR ID
router.get(
    "/:id",
    verificarToken,
    obtenerPedidoPorId
);


module.exports = router;