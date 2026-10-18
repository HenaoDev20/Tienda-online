const pool = require("../config/database");


// =========================
// REGISTRAR PAGO PENDIENTE
// =========================

async function registrarPago(req, res) {

    try {

        const usuarioId = req.usuario.id;

        const { pedido_id, metodo_pago } = req.body;

        // Validar ID del pedido
        if (
            !Number.isSafeInteger(Number(pedido_id)) ||
            Number(pedido_id) <= 0
        ) {

            return res.status(400).json({
                mensaje: "ID del pedido inválido"
            });

        }

        // Validar método de pago
        if (metodo_pago !== "transferencia") {

            return res.status(400).json({
                mensaje: "Método de pago no permitido"
            });

        }

        // Consultar pedido y verificar propietario
        const resultadoPedido = await pool.query(
            `SELECT id, total, estado
             FROM pedidos
             WHERE id = $1
               AND usuario_id = $2`,
            [pedido_id, usuarioId]
        );

        if (resultadoPedido.rows.length === 0) {

            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });

        }

        const pedido = resultadoPedido.rows[0];

        // Verificar que tenga monto válido
        if (Number(pedido.total) <= 0) {

            return res.status(400).json({
                mensaje: "El pedido no tiene un total válido"
            });

        }

        // Registrar pago
        const resultadoPago = await pool.query(
            `INSERT INTO pagos
                (pedido_id, metodo_pago, monto, estado)
             VALUES ($1, $2, $3, 'pendiente')
             ON CONFLICT (pedido_id) DO NOTHING
             RETURNING
                id,
                pedido_id,
                metodo_pago,
                monto,
                estado,
                creado_en`,
            [
                pedido.id,
                metodo_pago,
                pedido.total
            ]
        );

        if (resultadoPago.rows.length === 0) {

            return res.status(409).json({
                mensaje:
                    "Este pedido ya tiene un pago registrado"
            });

        }

        res.status(201).json({
            mensaje: "Pago pendiente registrado correctamente",
            pago: resultadoPago.rows[0]
        });

    } catch (error) {

        console.error(
            "Error registrando pago:",
            error
        );

        res.status(500).json({
            mensaje: "Error al registrar el pago"
        });

    }

}

// =========================
// OBTENER TODOS LOS PAGOS
// ADMINISTRADOR
// =========================

async function obtenerTodosLosPagos(req, res) {

    try {

        const resultado = await pool.query(
            `SELECT
                pa.id,
                pa.pedido_id,
                pa.metodo_pago,
                pa.monto,
                pa.estado,
                pa.referencia,
                pa.creado_en,
                pa.verificado_en,

                pe.fecha AS fecha_pedido,
                pe.estado AS estado_pedido,

                u.id AS cliente_id,
                u.nombre AS cliente_nombre,
                u.email AS cliente_email

             FROM pagos pa

             INNER JOIN pedidos pe
                 ON pa.pedido_id = pe.id

             INNER JOIN usuarios u
                 ON pe.usuario_id = u.id

             ORDER BY pa.creado_en DESC, pa.id DESC`
        );

        res.status(200).json({
            pagos: resultado.rows
        });

    } catch (error) {

        console.error(
            "Error obteniendo pagos:",
            error
        );

        res.status(500).json({
            mensaje: "Error al obtener los pagos"
        });

    }

}

// =========================
// ACTUALIZAR ESTADO DEL PAGO
// ADMINISTRADOR
// =========================

async function actualizarEstadoPago(req, res) {

    const { id } = req.params;
    const { estado } = req.body;

    // Obtener administrador autenticado
    const administradorId = req.usuario.id;

    // Validar ID
    if (!/^[1-9]\d*$/.test(String(id))) {

        return res.status(400).json({
            mensaje: "ID de pago inválido"
        });

    }

    // Solo se pueden aprobar o rechazar pagos
    if (!["aprobado", "rechazado"].includes(estado)) {

        return res.status(400).json({
            mensaje: "Estado de pago inválido"
        });

    }

    let client;

    try {

        client = await pool.connect();

        await client.query("BEGIN");

        // Buscar el pago y bloquearlo
        const resultado = await client.query(
            `SELECT id, pedido_id, monto, estado
             FROM pagos
             WHERE id = $1
             FOR UPDATE`,
            [id]
        );

        if (resultado.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                mensaje: "Pago no encontrado"
            });

        }

        const pago = resultado.rows[0];

        // Solo se pueden actualizar pagos pendientes
        if (pago.estado !== "pendiente") {

            await client.query("ROLLBACK");

            return res.status(409).json({
                mensaje:
                    "Este pago ya fue procesado"
            });

        }

        // Actualizar pago
        const actualizacion = await client.query(
            `UPDATE pagos
             SET
                estado = $1,
                verificado_en = CURRENT_TIMESTAMP,
                verificado_por = $2
             WHERE id = $3
             RETURNING
                id,
                pedido_id,
                metodo_pago,
                monto,
                estado,
                referencia,
                creado_en,
                verificado_en,
                verificado_por`,
            [
                estado,
                administradorId,
                id
            ]
        );

        await client.query("COMMIT");

        res.status(200).json({
            mensaje:
                `Pago ${estado} correctamente`,
            pago: actualizacion.rows[0]
        });

    } catch (error) {

        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Error deshaciendo transacción:",
                    rollbackError
                );
            }
        }

        console.error(
            "Error actualizando estado del pago:",
            error
        );

        res.status(500).json({
            mensaje: "Error al actualizar el pago"
        });

    } finally {

        if (client) {
            client.release();
        }

    }

}


// =========================
// EXPORTAR FUNCIONES
// =========================

module.exports = {
    registrarPago,
     obtenerTodosLosPagos,
    actualizarEstadoPago
   
};