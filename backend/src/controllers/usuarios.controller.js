const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const crypto = require("crypto");

const {
    enviarCorreoRecuperacion
} = require("../services/email.service");

async function crearUsuario(req, res) {

    try {

        const { nombre, email, password } = req.body;

        // Validar que todos los campos existan
        if (!nombre || !email || !password) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        // Encriptar la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar usuario en PostgreSQL
        const resultado = await pool.query(
            `INSERT INTO usuarios (nombre, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, nombre, email`,
            [nombre, email, passwordHash]
        );

        res.status(201).json({
            mensaje: "Usuario creado correctamente",
            usuario: resultado.rows[0]
        });

    } catch (error) {

        console.error("Error creando usuario:", error);

        // Email duplicado
        if (error.code === "23505") {
            return res.status(409).json({
                mensaje: "El correo electrónico ya está registrado"
            });
        }

        // Error general del servidor
        res.status(500).json({
            mensaje: "Error al crear el usuario"
        });
    }
}


async function iniciarSesion(req, res) {

    try {

        const { email, password } = req.body;

        // Validar datos
        if (!email || !password) {
            return res.status(400).json({
                mensaje: "El email y la contraseña son obligatorios"
            });
        }

        // Buscar usuario por email
        const resultado = await pool.query(
            `SELECT id, nombre, email, password , rol
             FROM usuarios
             WHERE email = $1`,
            [email]
        );

        // Verificar si existe
        if (resultado.rows.length === 0) {
            return res.status(401).json({
                mensaje: "Email o contraseña incorrectos"
            });
        }

        const usuario = resultado.rows[0];

        // Comparar contraseña
        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: "Email o contraseña incorrectos"
            });
        }

        // Crear JWT

       
        const token = jwt.sign(
            {
                id: usuario.id,
                nombre:usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        // Login exitoso
        res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {

        console.error("Error iniciando sesión:", error);

        res.status(500).json({
            mensaje: "Error al iniciar sesión"
        });
    }
}

//Solicitud de recuperación de contraseña
async function solicitarRecuperacion(req, res) {

    try {

        const { email } = req.body;

        // Validar que se haya enviado el correo
        if (!email) {

            return res.status(400).json({
                mensaje:
                    "El correo electrónico es obligatorio"
            });

        }

        // Buscar usuario por email
        const resultado = await pool.query(
            `SELECT id, nombre, email
             FROM usuarios
             WHERE email = $1`,
            [email]
        );

        // Respuesta genérica si el usuario no existe
        if (resultado.rows.length === 0) {

            return res.status(200).json({
                mensaje:
                    "Si existe una cuenta asociada a este correo, recibirás instrucciones para recuperar tu contraseña."
            });

        }

        const usuario = resultado.rows[0];


        // ==================================
        // GENERAR TOKEN
        // ==================================

        const token =
            crypto.randomBytes(32).toString("hex");


        // ==================================
        // CREAR HASH DEL TOKEN
        // ==================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // ==================================
        // ESTABLECER EXPIRACIÓN
        // 15 MINUTOS
        // ==================================

        const expiracion =
            new Date(
                Date.now() + 15 * 60 * 1000
            );


        // ==================================
        // GUARDAR RECUPERACIÓN
        // ==================================

        await pool.query(
            `INSERT INTO recuperaciones_password
             (usuario_id, token_hash, expira_en)
             VALUES ($1, $2, $3)`,
            [
                usuario.id,
                tokenHash,
                expiracion
            ]
        );


        // ==================================
        // CREAR ENLACE DE RECUPERACIÓN
        // ==================================

        const enlaceRecuperacion =
            `http://localhost:5500/frontend/nueva-password.html?token=${token}`;



        // ==================================
        // ENVIAR CORREO
        // ==================================

        await enviarCorreoRecuperacion(
            usuario.email,
            enlaceRecuperacion
        );


        // ==================================
        // RESPUESTA
        // ==================================

        res.status(200).json({

            mensaje:
                "Si existe una cuenta asociada a este correo, recibirás instrucciones para recuperar tu contraseña."

        });

    } catch (error) {

        console.error(
            "Error solicitando recuperación:",
            error
        );

        res.status(500).json({
            mensaje:
                "No se pudo procesar la solicitud"
        });

    }
}

// Restablecer contraseña
async function restablecerPassword(req, res) {

    const client = await pool.connect();

    try {

        const { token, password } = req.body;


        // ==================================
        // VALIDAR DATOS
        // ==================================

        if (!token || !password) {

            return res.status(400).json({
                mensaje:
                    "El token y la nueva contraseña son obligatorios"
            });

        }


        // ==================================
        // VALIDAR CONTRASEÑA
        // ==================================

        if (password.length < 8) {

            return res.status(400).json({
                mensaje:
                    "La contraseña debe tener al menos 8 caracteres"
            });

        }


        // ==================================
        // GENERAR HASH DEL TOKEN
        // ==================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // ==================================
        // BUSCAR RECUPERACIÓN
        // ==================================

        const resultado = await client.query(
            `SELECT id, usuario_id, expira_en, usado
             FROM recuperaciones_password
             WHERE token_hash = $1`,
            [tokenHash]
        );


        // ==================================
        // VERIFICAR TOKEN
        // ==================================

        if (resultado.rows.length === 0) {

            return res.status(400).json({
                mensaje:
                    "El enlace de recuperación no es válido"
            });

        }


        const recuperacion = resultado.rows[0];


        // ==================================
        // VERIFICAR SI YA FUE USADO
        // ==================================

        if (recuperacion.usado) {

            return res.status(400).json({
                mensaje:
                    "Este enlace de recuperación ya fue utilizado"
            });

        }


        // ==================================
        // VERIFICAR EXPIRACIÓN
        // ==================================

        if (
            new Date() >
            new Date(recuperacion.expira_en)
        ) {

            return res.status(400).json({
                mensaje:
                    "El enlace de recuperación ha expirado"
            });

        }


        // ==================================
        // GENERAR HASH DE CONTRASEÑA
        // ==================================

        const passwordHash =
            await bcrypt.hash(password, 10);


        // ==================================
        // INICIAR TRANSACCIÓN
        // ==================================

        await client.query("BEGIN");


        // ==================================
        // ACTUALIZAR CONTRASEÑA
        // ==================================

        await client.query(
            `UPDATE usuarios
             SET password = $1
             WHERE id = $2`,
            [
                passwordHash,
                recuperacion.usuario_id
            ]
        );


        // ==================================
        // MARCAR TOKEN COMO USADO
        // ==================================

        await client.query(
            `UPDATE recuperaciones_password
             SET usado = TRUE
             WHERE id = $1`,
            [recuperacion.id]
        );


        // ==================================
        // CONFIRMAR TRANSACCIÓN
        // ==================================

        await client.query("COMMIT");


        // ==================================
        // RESPUESTA
        // ==================================

        res.status(200).json({
            mensaje:
                "Contraseña actualizada correctamente"
        });


    } catch (error) {

        // ==================================
        // DESHACER CAMBIOS
        // ==================================

        await client.query("ROLLBACK");


        console.error(
            "Error restableciendo contraseña:",
            error
        );


        res.status(500).json({
            mensaje:
                "No se pudo restablecer la contraseña"
        });


    } finally {

        // ==================================
        // DEVOLVER CONEXIÓN AL POOL
        // ==================================

        client.release();

    }

}

//Obtener info de clientes
async function obtenerClientes(req, res) {

    try {

        const resultado = await pool.query(
            `SELECT nombre, email
             FROM usuarios
             ORDER BY id ASC`
        );

        res.status(200).json({
            clientes: resultado.rows
        });

    } catch (error) {

        console.error(
            "Error obteniendo clientes:",
            error
        );

        res.status(500).json({
            mensaje: "Error al obtener los clientes"
        });

    }

}


module.exports = {
    crearUsuario,
    iniciarSesion,
    obtenerClientes,
    solicitarRecuperacion,
    restablecerPassword
};