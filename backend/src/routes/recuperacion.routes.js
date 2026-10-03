const express = require("express");

const router = express.Router();

const {
    solicitarRecuperacion
} = require("../controllers/usuarios.controller");


router.post(
    "/",
    solicitarRecuperacion
);


module.exports = router;