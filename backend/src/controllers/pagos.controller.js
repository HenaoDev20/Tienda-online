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
                pa.notificado_en,
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

    // =========================
    // OBTENER DATOS
    // =========================

    const { id } = req.params;

    const { estado } = req.body || {};

    // Administrador autenticado mediante JWT
    const administradorId = req.usuario.id;


    // =========================
    // VALIDAR ID DEL PAGO
    // =========================

    if (!/^[1-9]\d*$/.test(String(id))) {

        return res.status(400).json({
            mensaje: "ID de pago inválido"
        });

    }


    // =========================
    // VALIDAR ESTADO SOLICITADO
    // =========================

    if (!["aprobado", "rechazado"].includes(estado)) {

        return res.status(400).json({
            mensaje: "Estado de pago inválido"
        });

    }


    let client;

    try {

        // =========================
        // INICIAR TRANSACCIÓN
        // =========================

        client = await pool.connect();

        await client.query("BEGIN");


        // =========================
        // BUSCAR Y BLOQUEAR PAGO
        // =========================

        const resultado = await client.query(
            `SELECT
                id,
                pedido_id,
                monto,
                estado,
                notificado_en
             FROM pagos
             WHERE id = $1
             FOR UPDATE`,
            [id]
        );


        // =========================
        // VERIFICAR QUE EXISTA
        // =========================

        if (resultado.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                mensaje: "Pago no encontrado"
            });

        }

        const pago = resultado.rows[0];


        // =========================
        // VERIFICAR ESTADO ACTUAL
        // =========================

        // Solo pueden procesarse pagos pendientes.

        if (pago.estado !== "pendiente") {

            await client.query("ROLLBACK");

            return res.status(409).json({
                mensaje: "Este pago ya fue procesado"
            });

        }


        // =========================
        // VERIFICAR NOTIFICACIÓN
        // =========================

        // Para aprobar, el cliente debe haber
        // notificado previamente la transferencia.

        if (
            estado === "aprobado" &&
            pago.notificado_en === null
        ) {

            await client.query("ROLLBACK");

            return res.status(409).json({
                mensaje:
                    "El cliente todavía no ha notificado la transferencia"
            });

        }


        // =========================
        // ACTUALIZAR ESTADO DEL PAGO
        // =========================

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
                notificado_en,
                verificado_en,
                verificado_por`,
            [
                estado,
                administradorId,
                id
            ]
        );


        // =========================
        // CONFIRMAR TRANSACCIÓN
        // =========================

        await client.query("COMMIT");


        // =========================
        // RESPONDER AL CLIENTE
        // =========================

        return res.status(200).json({
            mensaje: `Pago ${estado} correctamente`,
            pago: actualizacion.rows[0]
        });


    } catch (error) {

        // =========================
        // REVERTIR CAMBIOS SI FALLA
        // =========================

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

        return res.status(500).json({
            mensaje: "Error al actualizar el pago"
        });


    } finally {

        // =========================
        // LIBERAR CONEXIÓN
        // =========================

        if (client) {
            client.release();
        }

    }

}



 // =========================
 // OBTENER MIS PAGOS
 // CLIENTE AUTENTICADO
 // =========================

 async function obtenerMisPagos(req, res) {

     try {

         // Obtener usuario desde el JWT
         const usuarioId = req.usuario.id;

         // Consultar los pagos del cliente
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

                 pe.fecha AS fecha_pedido

              FROM pagos pa

              INNER JOIN pedidos pe
                  ON pa.pedido_id = pe.id

              WHERE pe.usuario_id = $1

              ORDER BY pa.creado_en DESC, pa.id DESC`,
             [usuarioId]
         );

         // Enviar respuesta
         res.status(200).json({
             pagos: resultado.rows
         });

     } catch (error) {

         console.error(
             "Error obteniendo mis pagos:",
             error
         );

         res.status(500).json({
             mensaje: "Error al obtener los pagos"
         });

     }

 }



 // =========================
 // NOTIFICAR TRANSFERENCIA
 // CLIENTE AUTENTICADO
 // =========================

 async function notificarTransferencia(req, res) {

     const { id } = req.params;

     const usuarioId = req.usuario.id;

     // Validar ID
     if (!/^[1-9]\d*$/.test(String(id))) {

         return res.status(400).json({
             mensaje: "ID del pago inválido"
         });

     }

     // Referencia opcional
     const referencia = req.body?.referencia ?? null;

     if (
         referencia !== null &&
         (
             typeof referencia !== "string" ||
             referencia.trim().length > 100
         )
     ) {

         return res.status(400).json({
             mensaje: "Referencia bancaria inválida"
         });

     }

     try {

         // Actualizar únicamente pagos propios,
         // pendientes y no notificados

         const resultado = await pool.query(
             `UPDATE pagos pa
              SET
                  referencia = $1,
                  notificado_en = CURRENT_TIMESTAMP

              FROM pedidos pe

              WHERE pa.pedido_id = pe.id
                AND pa.id = $2
                AND pe.usuario_id = $3
                AND pa.estado = 'pendiente'
                AND pa.notificado_en IS NULL

              RETURNING
                  pa.id,
                  pa.pedido_id,
                  pa.monto,
                  pa.estado,
                  pa.referencia,
                  pa.notificado_en`,
             [
                 referencia === null
                     ? null
                     : referencia.trim(),
                 id,
                 usuarioId
             ]
         );

         if (resultado.rows.length === 0) {

             return res.status(409).json({
                 mensaje:
                     "No se pudo notificar el pago. Verifica que sea tuyo, esté pendiente y no haya sido notificado anteriormente."
             });

         }

         res.status(200).json({
             mensaje:
                 "Transferencia notificada correctamente. Pendiente de verificación.",
             pago: resultado.rows[0]
         });

     } catch (error) {

         console.error(
             "Error notificando transferencia:",
             error
         );

         res.status(500).json({
             mensaje:
                 "Error al notificar la transferencia"
         });

     }

 }



// =========================
// EXPORTAR FUNCIONES
// =========================

module.exports = {
    registrarPago,
    obtenerTodosLosPagos,
    actualizarEstadoPago,
    obtenerMisPagos,
    notificarTransferencia
   
};