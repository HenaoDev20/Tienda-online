require("dotenv").config();

const {
    enviarCorreoRecuperacion
} = require("./services/email.service");

async function probarCorreo() {

    try {

        await enviarCorreoRecuperacion(
            process.env.EMAIL_USER,
            "http://localhost:5500/nueva-password.html?token=prueba123"
        );

        console.log("Correo enviado correctamente");

    } catch (error) {

        console.error(
            "Error enviando correo:",
            error
        );
    }
}

probarCorreo();