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
// OBTENER TODOS LOS PEDIDOS
// ADMINISTRADOR
// =========================

async function obtenerTodosLosPedidos(req, res) {
    try {

        // Consultar pedidos, clientes y productos
        const resultado = await pool.query(
            `SELECT
                pe.id AS pedido_id,
                pe.fecha,
                pe.total,
                pe.estado,

                u.id AS cliente_id,
                u.nombre AS cliente_nombre,
                u.email AS cliente_email,

                dp.id AS detalle_id,
                dp.producto_id,
                p.nombre AS producto_nombre,
                p.marca AS producto_marca,
                dp.cantidad,
                dp.precio,
                dp.subtotal

            FROM pedidos pe

            INNER JOIN usuarios u
                ON pe.usuario_id = u.id

            LEFT JOIN detalle_pedido dp
                ON pe.id = dp.pedido_id

            LEFT JOIN productos p
                ON dp.producto_id = p.id

            ORDER BY
                pe.fecha DESC,
                pe.id DESC,
                dp.id ASC`
        );

        // Organizar los resultados por pedido
        const pedidosMap = new Map();

        for (const fila of resultado.rows) {

            // Crear el pedido si todavía no existe
            if (!pedidosMap.has(fila.pedido_id)) {

                pedidosMap.set(fila.pedido_id, {
                    id: fila.pedido_id,
                    fecha: fila.fecha,
                    total: fila.total,
                    estado: fila.estado,

                    cliente: {
                        id: fila.cliente_id,
                        nombre: fila.cliente_nombre,
                        email: fila.cliente_email
                    },

                    productos: []
                });
            }

            // Agregar los productos del pedido
            if (fila.detalle_id !== null) {

                pedidosMap.get(fila.pedido_id).productos.push({
                    detalle_id: fila.detalle_id,
                    producto_id: fila.producto_id,
                    nombre: fila.producto_nombre,
                    marca: fila.producto_marca,
                    cantidad: fila.cantidad,
                    precio: fila.precio,
                    subtotal: fila.subtotal
                });
            }
        }

        const pedidos = Array.from(pedidosMap.values());

        // Enviar respuesta
        res.status(200).json({
            pedidos: pedidos
        });

    } catch (error) {

        console.error(
            "Error obteniendo todos los pedidos:",
            error
        );

        res.status(500).json({
            mensaje: "Error al obtener los pedidos"
        });
    }
}

// =========================
// ACTUALIZAR ESTADO DE PEDIDO
// ADMINISTRADOR
// =========================

async function actualizarEstadoPedido(req, res) {

    const { id } = req.params;
    const { estado } = req.body;

    // Validar el ID del pedido

    if (!/^[1-9]\d*$/.test(String(id))) {

        return res.status(400).json({
            mensaje: "ID de pedido inválido"
        });

    }

    // Definir las transiciones permitidas

    const transiciones = {
        pendiente: "confirmado",
        confirmado: "enviado",
        enviado: "entregado"
    };

    const estadosValidos = [
        "pendiente",
        "confirmado",
        "enviado",
        "entregado"
    ];

    // Validar el estado solicitado

    if (!estadosValidos.includes(estado)) {

        return res.status(400).json({
            mensaje: "Estado de pedido inválido"
        });

    }

    let client;

    try {

        client = await pool.connect();

        // Iniciar transacción

        await client.query("BEGIN");

        // Buscar pedido y bloquear la fila
        // mientras se actualiza

        const resultado = await client.query(
            `SELECT id, estado
             FROM pedidos
             WHERE id = $1
             FOR UPDATE`,
            [id]
        );

        // Verificar que exista

        if (resultado.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });

        }

        const pedido = resultado.rows[0];

        const siguienteEstado =
            transiciones[pedido.estado];

        // Validar la transición

        if (estado !== siguienteEstado) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                mensaje:
                    `No se permite cambiar de ${pedido.estado} a ${estado}`
            });

        }

        // Actualizar el estado

        const actualizacion = await client.query(
            `UPDATE pedidos
             SET estado = $1
             WHERE id = $2
             RETURNING id, fecha, total, estado`,
            [estado, id]
        );

        // Confirmar transacción

        await client.query("COMMIT");

        res.status(200).json({
            mensaje: "Estado actualizado correctamente",
            pedido: actualizacion.rows[0]
        });

    } catch (error) {

        if (client) {
            await client.query("ROLLBACK");
        }

        console.error(
            "Error actualizando estado del pedido:",
            error
        );

        res.status(500).json({
            mensaje: "Error al actualizar el estado"
        });

    } finally {

        if (client) {
            client.release();
        }

    }

}

// =========================
// EXPORTAR
// =========================

module.exports = {

    crearPedido,
    obtenerMisPedidos,
    obtenerPedidoPorId,
    obtenerTodosLosPedidos,
    actualizarEstadoPedido

};