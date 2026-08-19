const express = require("express");

const router = express.Router();


const {
    obtenerEstadisticas
} = require("../controllers/dashboard.controller");


const verificarToken =
    require("../middleware/auth.middleware");

const verificarAdmin =
    require("../middleware/role.middleware");


// Obtener estadísticas del dashboard
router.get(
    "/",
    verificarToken,
    verificarAdmin,
    obtenerEstadisticas
);


module.exports = router;