const express = require("express");

const app = express();

// Middleware para leer JSON
app.use(express.json());

// Rutas de productos
const productosRoutes = require("./routes/productos.routes");

// Rutas de usuarios
const usuariosRoutes = require("./routes/usuarios.routes");

// Middleware de autenticación
const verificarToken = require("./middleware/auth.middleware");

// Registrar rutas
app.use("/productos", productosRoutes);
app.use("/usuarios", usuariosRoutes);

// Ruta protegida de prueba
app.get("/perfil", verificarToken, (req, res) => {

    res.json({
        mensaje: "Acceso autorizado",
        usuario: req.usuario
    });

});

module.exports = app;