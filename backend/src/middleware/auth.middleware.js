const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {

    try {

        // Obtener el header Authorization
        const authHeader = req.headers.authorization;

        // Verificar que exista
        if (!authHeader) {
            return res.status(401).json({
                mensaje: "Token de acceso requerido"
            });
        }

        // Verificar que tenga el formato Bearer TOKEN
        const partes = authHeader.split(" ");

        if (partes.length !== 2 || partes[0] !== "Bearer") {
            return res.status(401).json({
                mensaje: "Formato de token inválido"
            });
        }

        const token = partes[1];

        // Verificar el JWT
        const usuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Guardar los datos del usuario en la request
        req.usuario = usuario;

        // Continuar hacia el siguiente middleware/controlador
        next();

    } catch (error) {

        console.error("Error verificando token:", error.message);

        return res.status(401).json({
            mensaje: "Token inválido o expirado"
        });
    }
}

module.exports = verificarToken;