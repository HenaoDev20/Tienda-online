const parametros = new URLSearchParams(
    window.location.search
);

const token = parametros.get("token");

const formulario =
    document.getElementById(
        "formularioNuevaPassword"
    );

const mensaje =
    document.getElementById(
        "mensaje"
    );


// ==================================
// VERIFICAR TOKEN
// ==================================

if (!token) {

    mensaje.textContent =
        "El enlace de recuperación no es válido.";

    formulario.style.display = "none";

}


// ==================================
// FORMULARIO
// ==================================

formulario.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();

        const password =
            document.getElementById(
                "password"
            ).value;

        const confirmarPassword =
            document.getElementById(
                "confirmarPassword"
            ).value;


        // ==================================
        // COMPARAR CONTRASEÑAS
        // ==================================

        if (password !== confirmarPassword) {

            mensaje.textContent =
                "Las contraseñas no coinciden.";

            return;
        }


        try {

            const respuesta = await fetch(
                "http://localhost:3000/usuarios/restablecer-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        token: token,
                        password: password
                    })
                }
            );


            const datos =
                await respuesta.json();


            console.log(
                "Respuesta del servidor:",
                datos
            );


            mensaje.textContent =
                datos.mensaje;


            // ==================================
            // SI LA CONTRASEÑA SE CAMBIÓ
            // ==================================

            if (respuesta.ok) {

                formulario.reset();

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 2000);

            }


        } catch (error) {

            console.error(
                "Error:",
                error
            );

            mensaje.textContent =
                "No se pudo conectar con el servidor.";

        }

    }
);