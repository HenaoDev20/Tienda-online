function verificarAdmin(req, res, next) {

    // Verificar que exista un usuario autenticado
    if (!req.usuario) {
        return res.status(401).json({
            mensaje: "Usuario no autenticado"
        });
    }

    // Verificar que tenga rol de administrador
    if (req.usuario.rol !== "admin") {
        return res.status(403).json({
            mensaje: "No tienes permisos para realizar esta acción"
        });
    }

    // Es administrador, puede continuar
    next();
}

module.exports = verificarAdmin;