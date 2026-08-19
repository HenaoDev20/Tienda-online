const pool = require("../config/database");



// OBTENER ESTADÍSTICAS DEL DASHBOARD


async function obtenerEstadisticas(req, res) {

    try {

        // Obtener cantidad de productos
        const productos = await pool.query(
            `SELECT COUNT(*) AS total
             FROM productos`
        );


        // Obtener cantidad de usuarios
        const usuarios = await pool.query(
            `SELECT COUNT(*) AS total
             FROM usuarios`
        );


        // Enviar respuesta
        res.status(200).json({

            productos: Number(
                productos.rows[0].total
            ),

            usuarios: Number(
                usuarios.rows[0].total
            )

        });


    } catch (error) {

        console.error(
            "Error obteniendo estadísticas:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error obteniendo estadísticas del dashboard"

        });

    }

}


module.exports = {
    obtenerEstadisticas
};