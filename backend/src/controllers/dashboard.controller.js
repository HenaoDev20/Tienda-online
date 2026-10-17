const pool = require("../config/database");


// =========================
// OBTENER ESTADÍSTICAS
// DEL DASHBOARD
// =========================

async function obtenerEstadisticas(req, res) {

    try {

        // =========================
        // TOTAL DE PRODUCTOS
        // =========================

        const productos = await pool.query(
            `SELECT COUNT(*) AS total
             FROM productos`
        );


        // =========================
        // TOTAL DE USUARIOS
        // =========================

        const usuarios = await pool.query(
            `SELECT COUNT(*) AS total
             FROM usuarios`
        );


        // =========================
        // ESTADÍSTICAS DE PEDIDOS
        // =========================

        const pedidos = await pool.query(
            `SELECT
                COUNT(*) AS total,

                COUNT(*) FILTER (
                    WHERE estado = 'pendiente'
                ) AS pendientes,

                COUNT(*) FILTER (
                    WHERE estado = 'entregado'
                ) AS entregados

             FROM pedidos`
        );


        // =========================
        // ENVIAR RESPUESTA
        // =========================

        res.status(200).json({

            productos: Number(
                productos.rows[0].total
            ),

            usuarios: Number(
                usuarios.rows[0].total
            ),

            pedidos: {

                total: Number(
                    pedidos.rows[0].total
                ),

                pendientes: Number(
                    pedidos.rows[0].pendientes
                ),

                entregados: Number(
                    pedidos.rows[0].entregados
                )

            }

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