const express = require("express");

const router = express.Router();

const {
    registrarPago,
    obtenerTodosLosPagos,
    actualizarEstadoPago
} = require("../controllers/pagos.controller");

const verificarToken =
    require("../middleware/auth.middleware");

const verificarAdmin =
    require("../middleware/role.middleware");


// =========================
// REGISTRAR PAGO
// CLIENTE
// =========================

router.post(
    "/",
    verificarToken,
    registrarPago
);


// =========================
// CONSULTAR TODOS LOS PAGOS
// ADMINISTRADOR
// =========================

router.get(
    "/admin/todos",
    verificarToken,
    verificarAdmin,
    obtenerTodosLosPagos
);


// =========================
// ACTUALIZAR ESTADO DEL PAGO
// ADMINISTRADOR
// =========================

router.patch(
    "/admin/:id/estado",
    verificarToken,
    verificarAdmin,
    actualizarEstadoPago
);


module.exports = router;