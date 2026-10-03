const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function enviarCorreoRecuperacion(
    correoDestino,
    enlaceRecuperacion
) {

    await transporter.sendMail({

        from: `"Tienda Online" <${process.env.EMAIL_USER}>`,

        to: correoDestino,

        subject: "Recuperación de contraseña",

        html: `
            <h2>Recuperación de contraseña</h2>

            <p>
                Has solicitado recuperar la contraseña
                de tu cuenta en Tienda Online.
            </p>

            <p>
                Haz clic en el siguiente enlace para
                establecer una nueva contraseña:
            </p>

            <a href="${enlaceRecuperacion}">
                Recuperar mi contraseña
            </a>

            <p>
                Este enlace será válido durante 15 minutos.
            </p>

            <p>
                Si no solicitaste este cambio,
                puedes ignorar este correo.
            </p>
        `
    });
}

module.exports = {
    enviarCorreoRecuperacion
};