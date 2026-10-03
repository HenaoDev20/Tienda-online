const formulario =
    document.getElementById(
        "formularioRecuperacion"
    );

const mensaje =
    document.getElementById(
        "mensaje"
    );

formulario.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();

        const email =
            document.getElementById(
                "email"
            ).value;

        try {

            const respuesta = await fetch(
                "http://localhost:3000/recuperacion",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email
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

        } catch (error) {

            console.error(
                "Error:",
                error
            );

            mensaje.textContent =
                "No se pudo conectar con el servidor";
        }

    }
);