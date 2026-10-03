const express = require("express");
const cors = require("cors");

const app = express();



// Permitir peticiones desde el frontend
app.use(cors());


// Middleware para leer JSON
app.use(express.json());


// Rutas de productos
const productosRoutes = require("./routes/productos.routes");


// Rutas de usuarios
const usuariosRoutes = require("./routes/usuarios.routes");


// Rutas del dashboard

const dashboardRoutes =
    require("./routes/dashboard.routes");


// Rutas de pedidos
const pedidosRoutes =
    require("./routes/pedidos.routes");

// Rutas de recuperación de contraseña
const recuperacionRoutes =
         require("./routes/recuperacion.routes");

// Registrar rutas
app.use("/productos", productosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/recuperacion", recuperacionRoutes);

app.get("/prueba", (req, res) => {
    res.json({
        mensaje: "El servidor funciona correctamente"
    });
});

module.exports = app;