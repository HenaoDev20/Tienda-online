const express = require("express");

const router = express.Router();


const {
    crearPedido
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


module.exports = router;