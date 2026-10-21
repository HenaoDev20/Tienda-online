
const express = require("express");

const router = express.Router();

const {
    registrarPago,
    obtenerTodosLosPagos,
    actualizarEstadoPago,
    obtenerMisPagos,
    notificarTransferencia
} = require("../controllers/pagos.controller");

const verificarToken =
    require("../middleware/auth.middleware");

const verificarAdmin =
    require("../middleware/role.middleware");


// =========================
// REGISTRAR PAGO
// CLIENTE AUTENTICADO
// =========================

router.post(
    "/",
    verificarToken,
    registrarPago
);


// =========================
// CONSULTAR MIS PAGOS
// CLIENTE AUTENTICADO
// =========================

router.get(
    "/mis-pagos",
    verificarToken,
    obtenerMisPagos
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


// =========================
// NOTIFICAR TRANSFERENCIA
// CLIENTE AUTENTICADO
// =========================

router.patch(
    "/:id/notificar",
    verificarToken,
    notificarTransferencia
);


module.exports = router;
