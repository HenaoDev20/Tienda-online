const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

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
            `SELECT id, nombre, email, password
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
                email: usuario.email
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
                email: usuario.email
            }
        });

    } catch (error) {

        console.error("Error iniciando sesión:", error);

        res.status(500).json({
            mensaje: "Error al iniciar sesión"
        });
    }
}


module.exports = {
    crearUsuario,
    iniciarSesion
};