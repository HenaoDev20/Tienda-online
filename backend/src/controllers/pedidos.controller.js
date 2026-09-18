const pool = require("../config/database");


// =========================
// CREAR PEDIDO
// =========================

async function crearPedido(req, res) {

    // Obtener una conexión del pool
    const client = await pool.connect();

    try {

        // =========================
        // USUARIO AUTENTICADO
        // =========================

        const usuarioId = req.usuario.id;


        // =========================
        // CARRITO RECIBIDO
        // =========================

        const { carrito } = req.body;


        if (!carrito || carrito.length === 0) {

            return res.status(400).json({
                mensaje: "El carrito está vacío"
            });

        }


        // =========================
        // INICIAR TRANSACCIÓN
        // =========================

        await client.query("BEGIN");


        // =========================
        // OBTENER IDS
        // =========================

        const idsProductos =
            carrito.map(item => item.id);


        // =========================
        // CONSULTAR PRODUCTOS
        // =========================

        const resultado = await client.query(

            `SELECT id, nombre, precio, cantidad
             FROM productos
             WHERE id = ANY($1::int[])
             FOR UPDATE`,

            [idsProductos]

        );


        const productos = resultado.rows;


        // =========================
        // VERIFICAR PRODUCTOS
        // =========================

        if (productos.length !== carrito.length) {

            await client.query("ROLLBACK");

            return res.status(400).json({

                mensaje:
                    "Uno o más productos no existen"

            });

        }


        // =========================
        // VARIABLES
        // =========================

        let total = 0;

        const detalles = [];


        // =========================
        // VALIDAR Y CALCULAR
        // =========================

        for (const item of carrito) {


            const producto =
                productos.find(

                    producto =>
                        producto.id === item.id

                );


            // =========================
            // VALIDAR CANTIDAD
            // =========================

            if (
                !Number.isInteger(item.cantidad) ||
                item.cantidad <= 0
            ) {

                await client.query("ROLLBACK");

                return res.status(400).json({

                    mensaje:
                        `Cantidad inválida para ${producto.nombre}`

                });

            }


            // =========================
            // VALIDAR STOCK
            // =========================

            if (
                item.cantidad >
                Number(producto.cantidad)
            ) {

                await client.query("ROLLBACK");

                return res.status(400).json({

                    mensaje:
                        `Stock insuficiente para ${producto.nombre}`

                });

            }


            // =========================
            // PRECIO REAL
            // =========================

            const precio =
                Number(producto.precio);


            // =========================
            // SUBTOTAL
            // =========================

            const subtotal =
                precio * item.cantidad;


            // =========================
            // TOTAL
            // =========================

            total += subtotal;


            detalles.push({

                producto_id:
                    producto.id,

                cantidad:
                    item.cantidad,

                precio:
                    precio,

                subtotal:
                    subtotal

            });

        }


        // =========================
        // CREAR PEDIDO
        // =========================

        const resultadoPedido =
            await client.query(

                `INSERT INTO pedidos
                (usuario_id, total, estado)
                VALUES ($1, $2, $3)
                RETURNING id, usuario_id, fecha, total, estado`,

                [
                    usuarioId,
                    total,
                    "pendiente"
                ]

            );


        const pedido =
            resultadoPedido.rows[0];


        // =========================
        // INSERTAR DETALLES
        // =========================

        for (const detalle of detalles) {

            await client.query(

                `INSERT INTO detalle_pedido
                (pedido_id, producto_id, cantidad, precio, subtotal)
                VALUES ($1, $2, $3, $4, $5)`,

                [
                    pedido.id,
                    detalle.producto_id,
                    detalle.cantidad,
                    detalle.precio,
                    detalle.subtotal
                ]

            );

        }


        // =========================
        // ACTUALIZAR STOCK
        // =========================

        for (const detalle of detalles) {

            await client.query(

                `UPDATE productos
                 SET cantidad = cantidad - $1
                 WHERE id = $2`,

                [
                    detalle.cantidad,
                    detalle.producto_id
                ]

            );

        }


        // =========================
        // CONFIRMAR TRANSACCIÓN
        // =========================

        await client.query("COMMIT");


        // =========================
        // RESPUESTA
        // =========================

        res.status(201).json({

            mensaje:
                "Pedido creado correctamente",

            pedido:
                pedido,

            detalles:
                detalles

        });


    } catch (error) {


        // =========================
        // DESHACER TRANSACCIÓN
        // =========================

        await client.query("ROLLBACK");


        console.error(
            "Error creando pedido:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al crear el pedido"

        });


    } finally {


        // =========================
        // DEVOLVER CONEXIÓN AL POOL
        // =========================

        client.release();

    }

}
// Cambios 17/09/26
// =========================
// OBTENER MIS PEDIDOS
// =========================

async function obtenerMisPedidos(req, res) {

   

    try {

        // =========================
        // USUARIO AUTENTICADO
        // =========================

        const usuarioId = req.usuario.id;


        // =========================
        // CONSULTAR PEDIDOS
        // =========================

        const resultado = await pool.query(

            `SELECT id, fecha, total, estado
             FROM pedidos
             WHERE usuario_id = $1
             ORDER BY fecha DESC`,

            [usuarioId]

        );


        // =========================
        // RESPUESTA
        // =========================

        res.status(200).json({

            pedidos: resultado.rows

        });


    } catch (error) {

        console.error(
            "Error obteniendo pedidos:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al obtener los pedidos"

        });

    }

}

// =========================
// OBTENER PEDIDO POR ID
// =========================

async function obtenerPedidoPorId(req, res) {

    try {

        // =========================
        // OBTENER DATOS
        // =========================

        const usuarioId = req.usuario.id;
        const { id } = req.params;


        // =========================
        // OBTENER PEDIDO
        // =========================

        const resultadoPedido = await pool.query(

            `SELECT id, fecha, total, estado
             FROM pedidos
             WHERE id = $1
             AND usuario_id = $2`,

            [
                id,
                usuarioId
            ]

        );


        // =========================
        // VERIFICAR PEDIDO
        // =========================

        if (resultadoPedido.rows.length === 0) {

            return res.status(404).json({

                mensaje:
                    "Pedido no encontrado"

            });

        }


        const pedido =
            resultadoPedido.rows[0];


        // =========================
        // OBTENER DETALLES
        // =========================

        const resultadoDetalles = await pool.query(

            `SELECT
                dp.producto_id,
                p.nombre,
                dp.cantidad,
                dp.precio,
                dp.subtotal
             FROM detalle_pedido dp
             INNER JOIN productos p
                ON dp.producto_id = p.id
             WHERE dp.pedido_id = $1
             ORDER BY dp.id ASC`,

            [
                id
            ]

        );


        // =========================
        // RESPUESTA
        // =========================

        res.status(200).json({

            pedido: pedido,

            detalles:
                resultadoDetalles.rows

        });


    } catch (error) {

        console.error(
            "Error obteniendo pedido:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al obtener el pedido"

        });

    }

}

// =========================
// EXPORTAR
// =========================

module.exports = {

    crearPedido,
    obtenerMisPedidos,
    obtenerPedidoPorId

};