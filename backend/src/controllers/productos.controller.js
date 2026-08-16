const pool = require("../config/database");


async function obtenerProductos(req, res) {

    try {

        const resultado = await pool.query(
            `SELECT id, nombre, marca, precio, cantidad, imagen
             FROM productos
             ORDER BY id ASC`
        );

        res.status(200).json({
            productos: resultado.rows
        });

    } catch (error) {

        console.error("Error obteniendo productos:", error);

        res.status(500).json({
            mensaje: "Error al obtener los productos"
        });
    }
}

async function obtenerProductoPorId(req, res) {

    try {

        const { id } = req.params;

        const resultado = await pool.query(
            `SELECT id, nombre, marca, precio, cantidad, imagen
             FROM productos
             WHERE id = $1`,
            [id]
        );

        // Verificar si existe
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.status(200).json({
            producto: resultado.rows[0]
        });

    } catch (error) {

        console.error("Error obteniendo producto:", error);

        res.status(500).json({
            mensaje: "Error al obtener el producto"
        });
    }
}


async function crearProducto(req, res) {

    try {

        const {
            nombre,
            marca,
            precio,
            cantidad,
            imagen
        } = req.body;


        // Validar campos
        if (
            !nombre ||
            !marca ||
            precio === undefined ||
            cantidad === undefined ||
            !imagen
        ) {

            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }


        const resultado = await pool.query(
            `INSERT INTO productos
            (nombre, marca, precio, cantidad, imagen)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, nombre, marca, precio, cantidad, imagen`,
            [
                nombre,
                marca,
                precio,
                cantidad,
                imagen
            ]
        );


        res.status(201).json({
            mensaje: "Producto creado correctamente",
            producto: resultado.rows[0]
        });


    } catch (error) {

        console.error("Error creando producto:", error);

        res.status(500).json({
            mensaje: "Error al crear el producto"
        });
    }
}

async function actualizarProducto(req, res) {

    try {

        const { id } = req.params;

        const {
            nombre,
            marca,
            precio,
            cantidad,
            imagen
        } = req.body;

        // Validar campos
        if (
            !nombre ||
            !marca ||
            precio === undefined ||
            cantidad === undefined ||
            !imagen
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        const resultado = await pool.query(
            `UPDATE productos
             SET nombre = $1,
                 marca = $2,
                 precio = $3,
                 cantidad = $4,
                 imagen = $5
             WHERE id = $6
             RETURNING id, nombre, marca, precio, cantidad, imagen`,
            [
                nombre,
                marca,
                precio,
                cantidad,
                imagen,
                id
            ]
        );

        // Producto no encontrado
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Producto actualizado correctamente",
            producto: resultado.rows[0]
        });

    } catch (error) {

        console.error("Error actualizando producto:", error);

        res.status(500).json({
            mensaje: "Error al actualizar el producto"
        });
    }
}

async function eliminarProducto(req, res) {

    try {

        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM productos
             WHERE id = $1
             RETURNING id, nombre, marca, precio, cantidad, imagen`,
            [id]
        );

        // Producto no encontrado
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Producto eliminado correctamente",
            producto: resultado.rows[0]
        });

    } catch (error) {

        console.error("Error eliminando producto:", error);

        res.status(500).json({
            mensaje: "Error al eliminar el producto"
        });
    }
}


module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};

   
